import ping from "ping"
import path from "path"
import {
  checkForMissingParams,
  decipherData,
  encryptData,
  getMissingFields,
} from "../helpers/utils"
import fsp from "fs/promises"
import { IServer, IServerDeciphered } from "../schemas/Servers"
import constants from "../helpers/constants"
import { db } from "../db"
import { ObjectId } from "mongodb"
import SSHService from "./sshService"
import { IIntegration } from "../schemas/Integrations"
import { IEncryptedData, ILinkedId } from "../interfaces/interfaces"
import { IDomain } from "../schemas/Domains"
import { camelCase } from "lodash"
import { initializeDockerClients } from "../background/init/clients"
import DockerService from "./dockerService"
import { ISwarm } from "../schemas/Swarms"

export default class ServerService {
  _id?: ObjectId
  server?: IServer
  constructor() {}

  async create(data: any) {
    checkForMissingParams(data, [
      "server_ip_address",
      "ssh_port",
      "admin_username",
      "private_key",
      "server_name",
    ])

    // Check if server already exists
    const server = await db.managementDb
      ?.collection<IServer>("servers")
      .findOne({
        server_ip_address: data.server_ip_address,
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
    if (server) {
      throw { showError: "Server already exists" }
    }

    const temp_config: IServer["temp_config"] = {
      create_swarm: data.create_swarm,
      swarm_id: data?.swarm_id ? new ObjectId(data?.swarm_id) : undefined,
      node_type: data?.node_type,
    }

    const payload: IServer = {
      temp_config,
      server_ip_address: data.server_ip_address,
      ssh_port: data.ssh_port,
      admin_username: encryptData(data.admin_username),
      private_key: encryptData(data.private_key),
      server_name: data.server_name,
      server_status: constants.SERVER_STATUSES.PENDING_INITIALIZATION,
      status: constants.STATUSES.ACTIVE_STATUS,
      availability: constants.AVAILABILITY.ONLINE,
      availability_changed: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      linked_ids: [],
    }

    const result = await db.managementDb
      ?.collection<IServer>("servers")
      .insertOne(payload)

    if (!result?.insertedId) throw { showError: "Server could not be created" }

    return { _id: result.insertedId }
  }

  async testConnection(data: any) {
    const missingParams = getMissingFields(data, [
      "server_ip_address",
      "ssh_port",
      "admin_username",
      "private_key",
    ])

    if (missingParams.length > 0) {
      return {
        success: false,
        data: { error: "Missing required params", missingParams },
      }
    }

    const sshService = new SSHService({
      host: data.server_ip_address,
      port: data.ssh_port,
      username: data.admin_username,
      privateKey: data.private_key,
    })
    await sshService.connect()
    await sshService.testAdmin()
    const osInfo = await sshService.getOsInfo()
    if (!osInfo?.OperatingSystemPrettyName.includes("Ubuntu"))
      throw { showError: "Only Ubuntu is supported at this time" }

    return { success: true }
  }
  async update(id: string, data: any) {}
  async delete(id: string) {}
  async findMany(query: any) {
    const { search } = query
    const servers = await db.managementDb
      ?.collection<IServer>("servers")
      .find({
        $or: [
          { server_name: { $regex: new RegExp(search, "i") } },
          { server_ip_address: { $regex: new RegExp(search, "i") } },
        ],
        status: constants.STATUSES.ACTIVE_STATUS,
      })
      .project({ admin_username: 0, private_key: 0, "docker_data.certs": 0 })
      .limit(10000)
      .toArray()

    return { servers }
  }

  async #getDockerInfo(ssh: SSHService) {
    const dockerInfo = await ssh
      .execCommand("sudo docker info -f json")
      .catch((error) => {
        console.log(error)
        throw new Error(error?.stderr)
      })

    return JSON.parse(dockerInfo.stdout)
  }
  async #enableDockerEngineAPI(ssh: SSHService) {
    const overrideFile = await fsp.readFile(
      path.join(__dirname, "../", "configs/dockerServiceOverride.conf"),
      {
        encoding: "utf-8",
      }
    )
    await ssh.execCommand(`sudo mkdir -p /etc/systemd/system/docker.service.d`)
    const result = await ssh.execCommand(
      'echo "' +
        overrideFile +
        '" | sudo tee /etc/systemd/system/docker.service.d/override.conf'
    )

    if (result.code !== 0) {
      throw new Error(result.stderr)
    }

    await this.secureDocker(ssh)
    await ssh.execCommand("sudo systemctl daemon-reload")
    await ssh.execCommand("sudo systemctl restart docker")
  }
  async #installDocker(ssh: SSHService) {
    console.log("installing docker")
    const osInfo = await ssh.getOsInfo()
    if (osInfo?.OperatingSystemPrettyName.includes("Ubuntu")) {
      await ssh.execCommand("sudo mkdir -p /saascape/scripts/docker")
      const dockerUbuntuInstallScript = await fsp.readFile(
        path.join(
          __dirname,
          "../",
          "scripts",
          "docker",
          constants.SCRIPTS.DOCKER.DOCKER_INSTALL.UBUNTU
        ),
        "utf-8"
      )
      await ssh.execCommand(
        `echo "${dockerUbuntuInstallScript}" | sudo tee /saascape/scripts/docker/${constants.SCRIPTS.DOCKER.DOCKER_INSTALL.UBUNTU}`
      )
      await ssh.execCommand(
        `sudo sh /saascape/scripts/docker/${constants.SCRIPTS.DOCKER.DOCKER_INSTALL.UBUNTU}`
      )
    } else {
      throw new Error("Only Ubuntu is supported")
    }
  }
  async #createDockerIntegration(dockerInfo: any) {
    const { ID } = dockerInfo
    const { Version } = dockerInfo?.ClientInfo
    const serverId = this._id

    if (!serverId) {
      throw new Error("Missing serverId")
    }

    if (!ID || !Version) {
      throw new Error(
        "Docker info missing values, unable to create integration"
      )
    }
    const payload: IIntegration = {
      _id: new ObjectId(),
      name: constants.INTEGRATIONS.DOCKER,
      status: constants.STATUSES.ACTIVE_STATUS,
      created_at: new Date(),
      updated_at: new Date(),
      config: {
        id: ID,
        version: Version,
      },
      type: constants.INTEGRATION_TYPES.INDEPENDENT,
      module: constants.MODULES.SERVER,
    }

    const result = await db.managementDb
      ?.collection<IIntegration>("integrations")
      .insertOne(payload)

    if (!result?.insertedId) throw new Error("Integration could not be created")

    const linkedIdObj: ILinkedId = {
      _id: new ObjectId(),
      name: constants.INTEGRATIONS.DOCKER,
      integration_id: result?.insertedId,
    }

    await db.managementDb
      ?.collection<IServer>("servers")
      .updateOne(
        { _id: new ObjectId(serverId) },
        { $push: { linked_ids: linkedIdObj } }
      )

    return
  }
  async #getNginxInfo(ssh: SSHService) {
    console.log("getting nginx info")
    const nginxInfo = await ssh
      .execCommand("sudo nginx -v 2>&1")
      .catch((error) => {
        console.log(error)
        throw { showError: error?.stderr }
      })

    console.log(nginxInfo)

    if (nginxInfo?.stderr) {
      throw new Error(nginxInfo?.stderr)
    }

    const version = nginxInfo?.stdout?.split("nginx version: ")[1]

    return version
  }
  async #installNginx(ssh: SSHService) {
    console.log("installing nginx")
    const osInfo = await ssh.getOsInfo()
    if (osInfo?.OperatingSystemPrettyName.includes("Ubuntu")) {
      await ssh
        .execCommand("sudo apt-get update && sudo apt-get install nginx -y")
        .catch((error) => {
          console.log(error)
          throw new Error(error?.stderr)
        })
    } else {
      throw new Error("Only Ubuntu is supported")
    }
  }
  async #createNginxIntegration(version: string) {
    const serverId = this._id

    const payload: IIntegration = {
      _id: new ObjectId(),
      name: constants.INTEGRATIONS.NGINX,
      status: constants.STATUSES.ACTIVE_STATUS,
      created_at: new Date(),
      updated_at: new Date(),
      config: {
        version,
      },
      type: constants.INTEGRATION_TYPES.INDEPENDENT,
      module: constants.MODULES.SERVER,
    }

    const result = await db.managementDb
      ?.collection<IIntegration>("integrations")
      .insertOne(payload)

    if (!result?.insertedId) throw new Error("Integration could not be created")

    const linkedIdObj: ILinkedId = {
      _id: new ObjectId(),
      name: constants.INTEGRATIONS.NGINX,
      integration_id: result?.insertedId,
    }

    await db.managementDb
      ?.collection<IServer>("servers")
      .updateOne(
        { _id: new ObjectId(serverId) },
        { $push: { linked_ids: linkedIdObj } }
      )

    return
  }
  async applyNginxSaaScapeFile(ssh: SSHService) {
    const localPath = path.join(
      __dirname,
      "../",
      "public",
      "files",
      "html",
      "saascapeNginx.html"
    )
    const file = await fsp.readFile(localPath, "utf8")

    const remotePath = "/var/www/html/index.html"
    await ssh.execCommand(`echo "${file}" | sudo tee ${remotePath}`)
    await ssh.execCommand("sudo nginx -s reload")
  }
  async installOpenSSL(ssh: SSHService) {
    // const exec1 = await ssh.execCommand(
    //   "sudo apt-get update && sudo apt-get upgrade -y"
    // )
    // const exec2 = await ssh.execCommand(
    //   "sudo apt install build-essential checkinstall zlib1g-dev -y"
    // )
    // const exec3 = await ssh.execCommand(
    //   "cd /usr/local/src/ && wget https://www.openssl.org/source/old/1.1.1/openssl-1.1.1f.tar.gz"
    // )
    // const exec4 = await ssh.execCommand(
    //   "cd /usr/local/src/ && tar -xvf openssl-1.1.1f.tar.gz"
    // )
    // const exec5 = await ssh.execCommand(
    //   "cd /usr/local/src/openssl-1.1.1f && ./config && make && make install"
    // )
    // //     ./config --prefix=/usr/local/ssl --openssldir=/usr/local/ssl shared zlib
    // // make
    // // make test
    // const exec6 = await ssh.execCommand(
    //   "cd /usr/local/src/openssl-1.1.1 &&./config --prefix=/usr/local/ssl --openssldir=/usr/local/ssl shared zlib"
    // )
    // const exec7 = await ssh.execCommand(
    //   "cd /usr/local/src/openssl-1.1.1 && make"
    // )
    // const exec8 = await ssh.execCommand(
    //   "cd /usr/local/src/openssl-1.1.1 && make test"
    // )
    // const exec9 = await ssh.execCommand(
    //   "cd /usr/local/src/openssl-1.1.1 && make install"
    // )
  }

  async checkIfOpenSSLInstalled(ssh: SSHService) {
    const response = await ssh.execCommand("sudo openssl version")
    if (response.code !== 0) throw new Error(response.stderr)
    return response.stdout
  }

  async secureDocker(ssh: SSHService) {
    // Get Server FQDN from info
    console.log("securing docker")
    const osInfo = await ssh.getOsInfo()
    const { Hostname: hostname } = osInfo
    const organization = "SaaScape"
    const serverPublicIp = this.server?.server_ip_address
    const serverPrivateIp = `10.0.0.1`

    await ssh.execCommand("sudo mkdir -p /saascape/docker/certs")
    await ssh.execCommand("sudo chmod -R u+rwx /saascape")
    await ssh.execCommand("sudo chown -R root:root /saascape")
    await ssh.execCommand("sudo mkdir -p /etc/ssl/docker/")

    // CA KEY
    await ssh.execCommand(
      "sudo openssl genrsa -aes256 -passout pass: -out /saascape/docker/certs/ca-key.pem 4096"
    )
    // CA
    await ssh.execCommand(
      `sudo openssl req -new -x509 -days 365 -key /saascape/docker/certs/ca-key.pem -sha256 -out /saascape/docker/certs/ca.pem -passin pass: -subj "/C=UK/ST=London/L=London/O=${organization}/CN=${hostname}"`
    )
    // KEY
    await ssh.execCommand(
      `sudo openssl genrsa -out /saascape/docker/certs/server-key.pem 4096`
    )
    // CSR
    await ssh.execCommand(`sudo openssl req -subj "/CN=${hostname}" -sha256 -new \
    -key /saascape/docker/certs/server-key.pem -out /saascape/docker/certs/server.csr`)

    // For some reason this step is not working correctly
    await ssh.execCommand(`echo subjectAltName = \
    DNS:${hostname},IP:${serverPublicIp},IP:${serverPrivateIp},IP:127.0.0.1 | sudo tee /saascape/docker/certs/extfile.cnf`)

    await ssh.execCommand(
      `echo extendedKeyUsage = serverAuth | sudo tee -a /saascape/docker/certs/extfile.cnf`
    )

    // Server Cert
    await ssh.execCommand(`sudo openssl x509 -req -days 365 -sha256 -in /saascape/docker/certs/server.csr -CA /saascape/docker/certs/ca.pem \
    -CAkey /saascape/docker/certs/ca-key.pem -CAcreateserial -out /saascape/docker/certs/server-cert.pem -extfile /saascape/docker/certs/extfile.cnf -passin pass:`)

    // Client Cert
    await ssh.execCommand(
      `sudo openssl genrsa -out /saascape/docker/certs/key.pem 4096`
    )

    await ssh.execCommand(
      `sudo openssl req -subj '/CN=client' -new -key /saascape/docker/certs/key.pem -out /saascape/docker/certs/client.csr`
    )

    await ssh.execCommand(
      `sudo echo extendedKeyUsage = clientAuth | sudo tee /saascape/docker/certs/extfile-client.cnf`
    )

    await ssh.execCommand(
      `sudo openssl x509 -req -days 365 -sha256 -in /saascape/docker/certs/client.csr -CA /saascape/docker/certs/ca.pem \
      -CAkey /saascape/docker/certs/ca-key.pem -passin pass: -CAcreateserial -out /saascape/docker/certs/cert.pem \
      -extfile /saascape/docker/certs/extfile-client.cnf`
    )

    // Update certs in DB
    const caCert = await ssh.execCommand(
      `sudo cat /saascape/docker/certs/ca.pem`
    )
    const serverCert = await ssh.execCommand(
      `sudo cat /saascape/docker/certs/server-cert.pem`
    )
    const serverKey = await ssh.execCommand(
      `sudo cat /saascape/docker/certs/server-key.pem`
    )
    const clientCert = await ssh.execCommand(
      `sudo cat /saascape/docker/certs/cert.pem`
    )
    const clientKey = await ssh.execCommand(
      `sudo cat /saascape/docker/certs/key.pem`
    )

    const encryptedValues = {
      ca: encryptData(caCert.stdout),
      server: encryptData(serverCert.stdout),
      serverKey: encryptData(serverKey.stdout),
      client: encryptData(clientCert.stdout),
      clientKey: encryptData(clientKey.stdout),
    }
    const certPayload: {
      ca: IEncryptedData
      server: { cert: IEncryptedData; key: IEncryptedData }
      client: { cert: IEncryptedData; key: IEncryptedData }
    } = {
      ca: {
        iv: encryptedValues.ca.iv,
        encryptedData: encryptedValues.ca.encryptedData,
      },
      server: {
        cert: {
          iv: encryptedValues.server.iv,
          encryptedData: encryptedValues.server.encryptedData,
        },
        key: {
          iv: encryptedValues.serverKey.iv,
          encryptedData: encryptedValues.serverKey.encryptedData,
        },
      },
      client: {
        cert: {
          iv: encryptedValues.client.iv,
          encryptedData: encryptedValues.client.encryptedData,
        },
        key: {
          iv: encryptedValues.clientKey.iv,
          encryptedData: encryptedValues.clientKey.encryptedData,
        },
      },
    }

    await ssh.execCommand(
      "sudo cp /saascape/docker/certs/ca.pem /saascape/docker/certs/server-cert.pem /saascape/docker/certs/server-key.pem /etc/ssl/docker/"
    )

    await db.managementDb?.collection("servers").updateOne(
      { _id: new ObjectId(this.server?._id) },
      {
        $set: {
          "docker_data.certs": certPayload,
          updated_at: new Date(),
        },
      }
    )
  }

  async getCpuInfo(ssh: SSHService) {
    const cpuInfo = await ssh.execCommand("sudo lscpu --json")
    const dataArray = JSON.parse(cpuInfo.stdout)?.lscpu
    const obj: { [key: string]: string } = {}
    for (const item of dataArray) {
      obj[camelCase(item.field)] = item?.data
    }

    return obj
  }

  async getDiskInfo(ssh: SSHService) {
    const diskInfo = await ssh.execCommand("sudo lsblk --bytes --json")
    const dataArray = JSON.parse(diskInfo.stdout)?.blockdevices
    const obj: { [key: string]: any } = {}

    let totalStorage = 0

    for (const item of dataArray) {
      if (item.type !== "disk") continue
      totalStorage += +item.size
      obj[camelCase(item.name)] = {
        size: item.size,
        ro: item.ro,
        rm: item.rm,
        mountpoints: item.mountpoints,
        children: [],
      }
      for (const child of item?.children || []) {
        obj[camelCase(item.name)].children.push({
          name: child.name,
          size: child.size,
          ro: child.ro,
          rm: child.rm,
          mountpoints: child.mountpoints,
        })
      }
    }

    return { disks: obj, totalStorage }
  }
  async beginInitialization(id: string) {
    // Give each stage a number and set to a class so that if failed, we can simply re init from a stage instead of starting from scratch. Error will throw the stage we was on
    const server = (await db.managementDb
      ?.collection<IServer>("servers")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            server_status: constants.SERVER_STATUSES.INITIALIZING,
            updated_at: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      )) as unknown as IServerDeciphered

    if (!server) {
      throw new Error("Server not found")
    }

    this._id = new ObjectId(id)
    this.server = server

    server.decipheredData = {
      admin_username: decipherData(
        server.admin_username.encryptedData,
        server.admin_username.iv
      ),
      private_key: decipherData(
        server.private_key?.encryptedData,
        server.private_key?.iv
      ),
    }

    const ssh = new SSHService({
      host: server.server_ip_address,
      port: server.ssh_port,
      username: server.decipheredData.admin_username,
      privateKey: server.decipheredData.private_key,
    })

    await ssh.connect()

    const osInfo = await ssh.getOsInfo()
    if (!osInfo?.OperatingSystemPrettyName.includes("Ubuntu"))
      throw new Error("Only Ubuntu is supported at this time")

    const cpuInfo = await this.getCpuInfo(ssh)
    const { totalStorage, disks } = await this.getDiskInfo(ssh)

    const systemInfo = {
      os: osInfo.OperatingSystemPrettyName,
      architecture: cpuInfo.architecture,
      cpu_core_count: cpuInfo.cpuS,
      cpu_model: cpuInfo?.modelName,
      storage: {
        totalStorage,
        disks,
      },
    }

    // Update OS info
    await db.managementDb?.collection("servers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          system_info: systemInfo,
          updated_at: new Date(),
        },
      }
    )

    let dockerInfo = await this.#getDockerInfo(ssh).catch(() => false)
    if (!dockerInfo) {
      await this.#installDocker(ssh)
      dockerInfo = await this.#getDockerInfo(ssh)
    }
    await this.#enableDockerEngineAPI(ssh)

    // Create docker integration
    await this.#createDockerIntegration(dockerInfo)

    // Nginx
    let nginxInfo = await this.#getNginxInfo(ssh).catch(() => false)
    if (!nginxInfo) {
      await this.#installNginx(ssh)
      nginxInfo = await this.#getNginxInfo(ssh)
    }

    await this.applyNginxSaaScapeFile(ssh)

    // Create nginx integration
    await this.#createNginxIntegration(nginxInfo as string)

    // Check and install openssl
    const openSSLVersion = await this.checkIfOpenSSLInstalled(ssh).catch(
      () => false
    )
    if (!openSSLVersion) {
      await this.installOpenSSL(ssh)
    }

    await initializeDockerClients()
    // Join/Create Swarm
    const dockerService = new DockerService(id)

    const {
      create_swarm,
      swarm_id,
      node_type = "worker",
    } = this?.server?.temp_config || {}

    if (!create_swarm && swarm_id) {
      await dockerService.joinSwarm(swarm_id, node_type)
    } else {
      await dockerService.createSwarm()
    }
  }
  async finishInitialization(id: string, status: string) {
    let serverStatus = ""
    switch (status) {
      case constants.STATUSES.COMPLETED_STATUS:
        serverStatus = constants.SERVER_STATUSES.SUCCESSFUL_INITIALIZATION
        break

      case constants.STATUSES.FAILED_STATUS:
        serverStatus = constants.SERVER_STATUSES.FAILED_INITIALIZATION
        break

      default:
        serverStatus = constants.SERVER_STATUSES.FAILED_INITIALIZATION
        break
    }

    await db.managementDb?.collection<IServer>("servers").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          server_status: serverStatus,
          updated_at: new Date(),
        },
      }
    )
    await db.managementDb?.collection<IServer>("servers").updateOne(
      { _id: new ObjectId(id) },
      {
        $unset: {
          temp_config: 1,
        },
      }
    )

    // Emit task to main server to notify of completion, server will then notify fe
  }
  async getServerAvailability(serverId?: string) {
    const statusMap = {
      [constants.AVAILABILITY.ONLINE]: true,
      [constants.AVAILABILITY.OFFLINE]: false,
    }

    if (serverId) {
      let server = await db.managementDb
        ?.collection<IServer>("servers")
        .findOne({ _id: new ObjectId(serverId) })
      if (!server) throw new Error("Server not found")
      const response = await ping.promise.probe(server.server_ip_address)
      if (statusMap?.[server?.availability] !== response.alive) {
        server = await db.managementDb
          ?.collection<IServer>("servers")
          .findOneAndUpdate(
            { _id: new ObjectId(serverId) },
            {
              $set: {
                availability: response.alive
                  ? constants.AVAILABILITY.ONLINE
                  : constants.AVAILABILITY.OFFLINE,
                availability_changed: new Date(),
              },
            },
            { returnDocument: "after" }
          )
      }

      return { availability: server?.availability }
    } else {
      const servers = await db.managementDb
        ?.collection<IServer>("servers")
        .find({ status: { $nin: [constants.STATUSES.DELETED_STATUS] } })
        .toArray()

      if (!servers) throw new Error("Servers not found")
      for (const server of servers) {
        const response = await ping.promise.probe(server.server_ip_address)
        if (statusMap?.[server?.availability] !== response.alive) {
          await db.managementDb?.collection<IServer>("servers").updateOne(
            { _id: new ObjectId(server?._id) },
            {
              $set: {
                availability: response.alive
                  ? constants.AVAILABILITY.ONLINE
                  : constants.AVAILABILITY.OFFLINE,
                availability_changed: new Date(),
              },
            }
          )
        }
      }
    }
  }

  async nginxTest(ssh: SSHService) {
    const nginxResult = await ssh.execCommand("sudo nginx -t")
    if (nginxResult.code !== 0) {
      throw new Error(nginxResult.stderr)
    }
  }
  async addDomain(
    serverId: string,
    data: { domain: IDomain; html: string; configFile: string }
  ) {
    const server = await db.managementDb
      ?.collection<IServer>("servers")
      .findOne({ _id: new ObjectId(serverId) })
    if (!server) throw new Error("Server not found")

    const { domain } = data

    const adminUsername = decipherData(
      server.admin_username.encryptedData,
      server.admin_username.iv
    )
    const privateKey = decipherData(
      server.private_key.encryptedData,
      server.private_key.iv
    )

    const ssh = new SSHService({
      host: server.server_ip_address,
      port: server.server_ssh_port,
      username: adminUsername,
      privateKey,
    })

    await ssh.connect()

    const mkDirResult = await ssh.execCommand(
      `sudo mkdir -p /var/www/${domain.domain_name}`
    )
    if (mkDirResult.code !== 0) {
      throw new Error(mkDirResult.stderr)
    }

    const mkIndexResult = await ssh.execCommand(
      `sudo echo "${data.html}" | sudo tee /var/www/${domain.domain_name}/index.html`
    )
    if (mkIndexResult.code !== 0) {
      throw new Error(mkIndexResult.stderr)
    }

    const nginxConfigFileResult = await ssh.execCommand(
      `sudo echo "${data.configFile}" | sudo tee /etc/nginx/sites-enabled/${domain.domain_name}`
    )
    if (nginxConfigFileResult.code !== 0) {
      throw new Error(nginxConfigFileResult.stderr)
    }

    const nginx = await this.nginxTest(ssh)

    const restartNginxResult = await ssh.execCommand("sudo nginx -s reload")
    if (restartNginxResult.code !== 0) {
      throw new Error(restartNginxResult.stderr)
    }
  }

  async getSshClient(serverId: string | ObjectId) {
    const server = await db.managementDb
      ?.collection<IServer>("servers")
      .findOne({ _id: new ObjectId(serverId) })
    if (!server) throw new Error("Server not found")

    const adminUsername = decipherData(
      server.admin_username.encryptedData,
      server.admin_username.iv
    )
    const privateKey = decipherData(
      server.private_key.encryptedData,
      server.private_key.iv
    )

    const ssh = new SSHService({
      host: server.server_ip_address,
      port: server.server_ssh_port,
      username: adminUsername,
      privateKey,
    })

    await ssh.connect()
    return ssh
  }

  async findSwarms() {
    const swarms = await db.managementDb
      ?.collection<ISwarm>("swarms")
      .find(
        {},
        { projection: { _id: 1, name: 1, ID: 1, created_at: 1, updated_at: 1 } }
      )
      .toArray()

    return { swarms }
  }
}
