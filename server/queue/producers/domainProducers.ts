import queues from "../../helpers/queues"
import { addTaskToQueue } from "../queue"

export const initializeDomainQueueProducer = async (data: any) => {
  await addTaskToQueue(queues.DOMAIN.INITIALIZE_DOMAIN, data)
}

export const initializeSSLOnDomainQueueProducer = async (data: any) => {
  await addTaskToQueue(queues.DOMAIN.INITIALIZE_SSL_ON_DOMAIN, data)
}
