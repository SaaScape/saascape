/*
 * Copyright SaaScape (c) 2024.
 */

import Bull from 'bull'
import queues from '../../helpers/queues'
import { getQueue } from '../queue'

import ServerService from '../../services/serverService'
import constants from '../../helpers/constants'
import { logError } from '../../helpers/error'
import DomainService from '../../services/domainsService'
import { initializeSSLOnDomainQueueProducer } from '../producers/domainProducers'
import { updateStatus } from 'types/enums'
import { db } from '../../db'
import IInstance, { instanceDbStatus } from 'types/schemas/Instances'
import { ObjectId } from 'mongodb'
import { socket } from '../../background/init/sockets'
import { InstanceSocketEvents } from 'types/sockets'
import Instance from '../../modules/instance'
import { clients } from '../../clients/clients'

const setInstanceUpdateStatus = async (instanceId: string, status: updateStatus) => {
  await db.managementDb
    ?.collection<IInstance>('instances')
    .updateOne(
      { _id: new ObjectId(instanceId) },
      { $set: { update_status: status, update_status_updated_at: new Date() } },
    )
}

const deployInstanceQueue = async () => {
  const queue = getQueue(queues.INSTANCE.DEPLOY_INSTANCE)

  queue.process(1, async (job: Bull.Job) => {
    console.log(`Deploying instance ${job.data?.instance_id} from Job ${job.id}`)
    const { instance_id } = job.data
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      .findOne({ _id: new ObjectId(instance_id), status: instanceDbStatus.ACTIVE })
    if (!instance) return
    const client =
      clients.instance?.[instance_id] ||
      (() => {
        const client = new Instance(instance)
        client.addToClients()
        return client
      })()
    await setInstanceUpdateStatus(job.data?.instance_id, updateStatus.UPDATING)
    await client.updateInstanceDetails()
    await client.service?.createService()
    // TODO: FIX BUG : This completed even though the service is not created as the server is offline...

    //   TODO: CRON for update timeout and set status to failed
  })

  queue.on('failed', async (job) => {
    console.log('failed to deploy instance', job.data?._id)
    await logError({
      error: { message: job.failedReason },
      entityId: job.data?._id,
      status: constants.STATUSES.FAILED_STATUS,
      module: constants.MODULES.INSTANCE,
      event: queues.INSTANCE.DEPLOY_INSTANCE,
    })
    await setInstanceUpdateStatus(job.data?.instance_id, updateStatus.READY)
    socket?.emit(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED, {
      instance_id: job.data?.instance_id,
      error: { message: job.failedReason },
    })
  })
  queue.on('completed', async (job) => {
    //   At this stage we will set updating status to ready
    await setInstanceUpdateStatus(job.data?.instance_id, updateStatus.READY)
    //   SOCKET
    console.log('completed instance deployment', job.data?.instance_id)
    socket?.emit(InstanceSocketEvents.INSTANCE_DEPLOYED, { instance_id: job.data?.instance_id })
  })
}

const initializeQueues = async () => {
  await Promise.allSettled([deployInstanceQueue()])
}

export default initializeQueues
