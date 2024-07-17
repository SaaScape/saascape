/*
 * Copyright SaaScape (c) 2024.
 */

import Bull from 'bull'
import queues from '../../helpers/queues'
import { getQueue } from '../queue'
import constants from '../../helpers/constants'
import { logError } from '../../helpers/error'
import { updateStatus } from 'types/enums'
import { db } from '../../db'
import IInstance, { instanceDbStatus } from 'types/schemas/Instances'
import { ObjectId } from 'mongodb'
import { socket } from '../../background/init/sockets'
import { InstanceSocketEvents } from 'types/sockets'
import Instance from '../../modules/instance'
import { clients } from '../../clients/clients'
import { createNotifications, NotificationMethods } from '../../helpers/utils'
import { notificationType } from 'types/schemas/Notifications'

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
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({
      _id: new ObjectId(instance_id),
      status: { $in: [instanceDbStatus.ACTIVE, instanceDbStatus.PENDING_DEPLOYMENT] },
    })
    if (!instance) throw new Error('Instance not found for deployment')
    const client =
      clients.instance?.[instance_id] ||
      (() => {
        const client = new Instance(instance)
        client.addToClients()
        return client
      })()
    await setInstanceUpdateStatus(job.data?.instance_id, updateStatus.UPDATING)
    await client.updateInstanceDetails()
    if (!client.service) throw new Error('Service not found for deployment')
    if (client.serviceId) {
      await client.service?.updateService()
    } else {
      await client.service?.createService()
    }
  })

  queue.on('failed', async (job) => {
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({
      _id: new ObjectId(job.data?.instance_id),
    })
    console.warn('failed to deploy instance', job.data?.instance_id)
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
    await createNotifications(
      {
        title: 'Instance Deployment Failed',
        body: `Instance ${instance?.name} has failed to deploy`,
        link: `/applications/${instance?.application_id}/instances/${job.data?.instance_id}`,
        sendMail: true,
        type: notificationType.ERROR,
        from: 'system',
      },
      NotificationMethods.BACKGROUND,
    )
  })
  queue.on('completed', async (job) => {
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({
      _id: new ObjectId(job.data?.instance_id),
    })
    if (!instance) throw new Error('Instance not found at completion')
    //   At this stage we will set updating status to ready
    await setInstanceUpdateStatus(job.data?.instance_id, updateStatus.READY)
    //   SOCKET
    console.log('completed instance deployment', job.data?.instance_id)
    socket?.emit(InstanceSocketEvents.INSTANCE_DEPLOYED, { instance_id: job.data?.instance_id })
    await createNotifications(
      {
        title: 'Instance Deployed',
        body: `Instance ${instance?.name} has been deployed successfully`,
        link: `/applications/${instance?.application_id}/instances/${job.data?.instance_id}`,
        sendMail: true,
        type: notificationType.INFO,
        from: 'system',
      },
      NotificationMethods.BACKGROUND,
    )
  })
}

const initializeQueues = async () => {
  await Promise.allSettled([deployInstanceQueue()])
}

export default initializeQueues
