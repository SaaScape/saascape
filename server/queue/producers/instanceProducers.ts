/*
 * Copyright SaaScape (c) 2024.
 */

import queues from '../../helpers/queues'
import { addTaskToQueue } from '../queue'

export const deployInstanceQueueProducer = async (data: any) => {
  await addTaskToQueue(queues.INSTANCE.DEPLOY_INSTANCE, data)
}
