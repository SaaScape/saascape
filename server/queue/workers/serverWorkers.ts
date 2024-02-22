import Bull from "bull"
import queues from "../../helpers/queues"
import { getQueue } from "../queue"

import ServerService from "../../services/serverService"
import constants from "../../helpers/constants"
import { logError } from "../../helpers/error"

const initializeInitServerQueue = async () => {
  const queue = getQueue(queues.SERVER.INITIALIZE_SERVER)
  queue.process(2, async (job: Bull.Job) => {
    console.log(`Initializing server ${job.data?._id} from Job ${job.id}`)
    const serverService = new ServerService()
    await serverService.beginInitialization(job.data?._id)
  })
  queue.on("failed", async (job) => {
    const serverService = new ServerService()
    serverService.finishInitialization(
      job.data?._id,
      constants.STATUSES.FAILED_STATUS
    )
    await logError({
      error: { message: job.failedReason },
      entityId: job.data?._id,
      status: constants.STATUSES.FAILED_STATUS,
      module: constants.MODULES.SERVER,
      event: queues.SERVER.INITIALIZE_SERVER,
    })
  })
  queue.on("completed", async (job) => {
    try {
      const serverService = new ServerService()
      await serverService.finishInitialization(
        job.data?._id,
        constants.STATUSES.COMPLETED_STATUS
      )
    } catch (err) {
      console.warn(err)
    }
  })
}

const initializeQueues = async () => {
  await Promise.allSettled([initializeInitServerQueue()])
}

export default initializeQueues
