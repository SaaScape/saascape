import { db } from "../../db"
import { IServer } from "../../schemas/Servers"
import constants from "../../helpers/constants"
import DockerService from "../../services/dockerService"
import { IDockerClients } from "../../interfaces/clients"

const clients: { docker: IDockerClients } = { docker: {} }
const initializeDockerClients = async () => {
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

const initializeClients = async () => {
  await Promise.allSettled([initializeDockerClients()])
  console.log("Clients have been initialized")
}

export { clients }
export default initializeClients
