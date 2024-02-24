import { db } from "../db"
import { IServer } from "../schemas/Servers"
import constants from "../helpers/constants"
import DockerService from "../services/dockerService"
import { IDockerClients, ISSHClients } from "../interfaces/clients"
import SSHService from "../services/sshService"
import { decipherData } from "../helpers/utils"

const clients: { docker: IDockerClients; ssh: ISSHClients } = {
  docker: {},
  ssh: {},
}
export const initializeDockerClients = async () => {
  console.log("Initializing docker clients")
  const servers = await db.managementDb
    ?.collection<IServer>("servers")
    .find({
      status: constants.STATUSES.ACTIVE_STATUS,
      "linked_ids.name": constants.INTEGRATIONS.DOCKER,
    })
    .toArray()

  for (const server of servers || []) {
    try {
      const dockerService = new DockerService(server._id)
      const dockerClient = await dockerService.getDockerClient()
      clients.docker[server?._id?.toString()] = dockerClient
    } catch (err) {
      console.warn(err)
    }
  }
}

export const initializeSSHClients = async () => {
  console.log("Initializing ssh clients")
  const servers = await db.managementDb
    ?.collection<IServer>("servers")
    .find({
      status: constants.STATUSES.ACTIVE_STATUS,
    })
    .toArray()

  for (const server of servers || []) {
    try {
      const adminUsername = decipherData(
        server?.admin_username?.encryptedData,
        server?.admin_username?.iv
      )
      const privateKey = decipherData(
        server?.private_key?.encryptedData,
        server?.private_key?.iv
      )

      const ssh = new SSHService({
        host: server?.server_ip_address,
        port: server?.server_ssh_port,
        username: adminUsername,
        privateKey,
      })

      clients.ssh[server?._id?.toString()] = ssh

      // Connection even listeners here
      ssh.client.connection?.on("close", async () => {
        console.log("connection to ssh client, closed. Attempting to reconnect")
        await ssh.connect()
      })
      await ssh.connect()
    } catch (err) {
      console.warn(err)
    }
  }
}

const initializeClients = async () => {
  await Promise.allSettled([initializeDockerClients(), initializeSSHClients()])
  console.log("Clients have been initialized")
}

export { clients }
export default initializeClients
