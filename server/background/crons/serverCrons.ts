import { CronJob } from "cron"
import ServerService from "../../services/serverService"
import { db } from "../../db"
import { IServer } from "../../schemas/Servers"
import constants from "../../helpers/constants"

const initializeServerCrons = (use: Function) => {
  const serverAvailabilityCron = new CronJob(
    "*/30 * * * * *",
    use(getServerAvailability)
  )
  serverAvailabilityCron.start()

  const syncDomainsCron = new CronJob("*/30 * * * * *", use(syncDomains))
  syncDomainsCron.start()
}

const getServerAvailability = async () => {
  const serverService = new ServerService()
  await serverService.getServerAvailability()
}

const syncDomains = async () => {
  console.log("syncing domains")
  const serverService = new ServerService()
  const servers = await db.managementDb
    ?.collection<IServer>("servers")
    .find({
      status: { $nin: [constants.STATUSES.DELETED_STATUS] },
    })
    .toArray()
  if (!servers) return

  for (const server of servers) {
    try {
      await serverService.syncDomains(server?._id)
    } catch (err) {
      console.warn(err)
    }
  }
}

export default initializeServerCrons
