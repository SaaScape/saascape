import Bull from "bull"
import queues from "../../helpers/queues"
import { getQueue } from "../queue"
import { IWorker, defaultOnFailed } from "./initWorkers"

const workers: { [key: string]: IWorker } = {
  [queues.SERVER.INITIALIZE_SERVER]: {
    worker: async (job: Bull.Job) => {
      console.log(`Initializing server ${job.data?._id} from Job ${job.id}`)
    },
    onComplete: async (job: Bull.Job) => {
      console.log(job.id, "finished")
      // await job.remove()
    },
  },
}

const initializeQueues = async () => {
  const queueNames = [queues.SERVER.INITIALIZE_SERVER]
  for (const queueName of queueNames) {
    const queue = getQueue(queueName)
    queue.process(5, workers[queueName]?.worker)
    queue.on("completed", workers[queueName]?.onComplete)
    queue.on("failed", workers[queueName]?.onFailed || defaultOnFailed)
  }
}

export default initializeQueues
