import { CronJob } from "cron"
import ServerService from "../../services/serverService"

const initializeServerCrons = (use: Function) => {
  const serverAvailabilityCron = new CronJob(
    "*/30 * * * * *",
    use(getServerAvailability)
  )
  serverAvailabilityCron.start()
}

const getServerAvailability = async () => {
  const serverService = new ServerService()
  await serverService.getServerAvailability()
}

export default initializeServerCrons
