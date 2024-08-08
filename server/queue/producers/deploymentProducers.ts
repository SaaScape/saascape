/*
 * Copyright SaaScape (c) 2024.
 */

import queues from '../../helpers/queues'
import { addTaskToQueue } from '../queue'

export const startDeploymentQueueProducer = async (deploymentId: string, data: any) => {
  await addTaskToQueue(`${queues.DEPLOYMENT.PROCESS_DEPLOYMENT}$$$${deploymentId}`, data)
}
