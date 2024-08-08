/*
 * Copyright SaaScape (c) 2024.
 */

import Bull from 'bull'
import queues from '../../helpers/queues'
import { getQueue } from '../queue'
import { clients } from '../../clients/clients'
import { DeploymentStatus } from 'types/schemas/Deployments'

const initializeDeploymentWorker = async (deploymentId: string) => {
  const queue = getQueue(`${queues.DEPLOYMENT.PROCESS_DEPLOYMENT}$$$${deploymentId}`)
  queue.process(1, async (job: Bull.Job) => {
    console.log(`Processing deployment of instance ${job.data?._id} from Job ${job.id}. DeploymentId: ${deploymentId}`)
    const { _id } = job.data
    const client = clients?.['deployment']?.[deploymentId]
    if (!client)
      throw new Error(`Unable to complete deployment job ${job.id} as client not found for deployment ${deploymentId}`)

    await client.updateTargetStatus(DeploymentStatus.RUNNING, _id)

    await new Promise((resolve) => setTimeout(resolve, 10000))
  })
  queue.on('failed', async (job) => {
    try {
      const { deploymentId, _id } = job.data
      console.log('Failed instance deployment', _id, 'for deployment', deploymentId)
      const client = clients?.['deployment']?.[deploymentId]
      if (!client)
        throw new Error(
          `Unable to fail deployment job ${job?.data?._id} as client not found for deployment ${deploymentId}`,
        )
      await client.finishSingleInstanceDeployment(_id, DeploymentStatus.FAILED)

      // await logError({
      //   error: { message: job.failedReason },
      //   entityId: job.data?._id,
      //   status: constants.STATUSES.FAILED_STATUS,
      //   module: constants.MODULES.DOMAIN,
      //   event: queues.DOMAIN.INITIALIZE_DOMAIN,
      // })
    } catch (err) {
      console.log(err)
    }
  })
  queue.on('completed', async (job) => {
    try {
      const { deploymentId, _id } = job.data
      console.log('completed instance deployment', _id, 'for deployment', deploymentId)
      const client = clients?.['deployment']?.[deploymentId]
      if (!client)
        throw new Error(
          `Unable to complete deployment job ${job.id} as client not found for deployment ${deploymentId}`,
        )
      await client.finishSingleInstanceDeployment(_id, DeploymentStatus.COMPLETED)
    } catch (err) {
      console.log(err)
    }
  })

  queue.on('drained', async () => {
    try {
      const client = clients?.['deployment']?.[deploymentId]
      if (!client) throw new Error(`Unable to finish deployment as client not found for deployment ${deploymentId}`)

      await client.deploymentFinished()
    } catch (err) {
      console.error(err)
    }
  })
}

export { initializeDeploymentWorker }
