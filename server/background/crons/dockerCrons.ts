import { CronJob } from "cron"
import { clients } from "../../clients/clients"
import { db } from "../../db"
import { IServer } from "../../schemas/Servers"
import { ObjectId } from "mongodb"
import constants from "../../helpers/constants"
import Dockerode from "dockerode"

const crons: { [key: string]: CronJob } = {}

const initializeDockerCrons = (use: Function) => {
  const serverAvailabilityCron = new CronJob(
    "*/10 * * * * *",
    use(getDockerAvailability)
  )
  crons["serverAvailabilityCron"] = serverAvailabilityCron
  serverAvailabilityCron.start()
}

const getIndividualDockerAvailability = async (
  dockerNode: Dockerode,
  serverId: string | ObjectId
) => {
  const server = await db.managementDb?.collection<IServer>("servers").findOne({
    _id: new ObjectId(serverId),
  })

  if (!server) return
  try {
    const data = (
      await dockerNode.ping().catch((err) => err.code || "Unable to ping")
    ).toString()

    const dataMap: { [key: string]: string } = {
      OK: constants.AVAILABILITY.ONLINE,
      ETIMEDOUT: constants.AVAILABILITY.OFFLINE,
      "Unable to ping": constants.AVAILABILITY.OFFLINE,
    }

    if (server?.docker_data?.availability?.status === dataMap[data]) return

    const payload = {
      status: dataMap?.[data] || constants.AVAILABILITY.OFFLINE,
      message: data,
      updated_at: new Date(),
    }

    if (
      payload?.status === server?.docker_data?.availability?.status &&
      payload?.message === server?.docker_data?.availability?.message
    )
      return

    await db.managementDb?.collection<IServer>("servers").updateOne(
      { _id: new ObjectId(serverId) },
      {
        $set: { "docker_data.availability": payload },
      }
    )
  } catch (err) {
    console.warn(err)
  }
}
const getDockerAvailability = async () => {
  crons.serverAvailabilityCron?.stop()
  const { docker: dockerClients } = clients
  const promises = []
  for (const [serverId, dockerNode] of Object.entries(dockerClients)) {
    promises.push(getIndividualDockerAvailability(dockerNode, serverId))
  }
  await Promise.allSettled(promises)
  crons.serverAvailabilityCron?.start()
}

export default initializeDockerCrons
