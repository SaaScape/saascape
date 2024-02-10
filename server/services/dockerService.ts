import { ObjectId } from "mongodb"
import { IServer } from "../schemas/Servers"
import { db } from "../db"
import { decipherData } from "../helpers/utils"
import Dockerode from "dockerode"

export default class DockerService {
  server_id: ObjectId
  server?: IServer
  constructor(server_id: string | ObjectId) {
    this.server_id = new ObjectId(server_id)
  }
  async #getCertificateInfo() {
    const server =
      this.server ||
      (await db.managementDb
        ?.collection<IServer>("servers")
        .findOne({ _id: this.server_id }))

    if (!server) throw new Error("Server not found")
    const { docker_data } = server
    if (!docker_data) throw new Error("Docker data not found")
    const { certs } = docker_data
    if (!certs) throw new Error("Certs not found")

    const decipheredCerts = {
      ca: decipherData(certs?.ca?.encryptedData, certs?.ca?.iv),
      server: {
        cert: decipherData(
          certs?.server?.cert?.encryptedData,
          certs?.server?.cert?.iv
        ),
        key: decipherData(
          certs?.server?.key?.encryptedData,
          certs?.server?.key?.iv
        ),
      },
      client: {
        cert: decipherData(
          certs?.client?.cert?.encryptedData,
          certs?.client?.cert?.iv
        ),
        key: decipherData(
          certs?.client?.key?.encryptedData,
          certs?.client?.key?.iv
        ),
      },
    }
    return { certs: decipheredCerts }
  }

  async getDockerClient() {
    const server =
      this.server ||
      (await db.managementDb
        ?.collection<IServer>("servers")
        .findOne({ _id: this.server_id }))

    if (!server) throw new Error("Server not found")
    this.server = server

    const { certs } = await this.#getCertificateInfo()

    const dockerClient = new Dockerode({
      host: server.server_ip_address,
      port: process.env.DOCKER_API_PORT || 2376,
      ca: certs.ca,
      cert: certs.client.cert,
      key: certs.client.key,
    })

    return dockerClient
  }

  async getDockerAvailability() {
    const dockerClient = await this.getDockerClient()
    const data = await dockerClient.ping()
    return data
  }
}
