import queues from "../../helpers/queues"
import { addTaskToQueue } from "../queue"

export const initializeDomainQueueProducer = async (data: any) => {
  await addTaskToQueue(queues.DOMAIN.INITIALIZE_DOMAIN, data)
}
