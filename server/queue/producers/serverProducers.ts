import queues from "../../helpers/queues"
import { addTaskToQueue } from "../queue"

export const initializeServerQueueProducer = async (data: any) => {
  await addTaskToQueue(queues.SERVER.INITIALIZE_SERVER, data)
}
