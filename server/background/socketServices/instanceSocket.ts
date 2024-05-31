/*
 * Copyright SaaScape (c) 2024.
 */

import constants from '../../helpers/constants'
import { db } from '../../db'
import IInstance, { instanceDbStatus } from 'types/schemas/Instances'
import { clients } from '../../clients/clients'
import Instance from '../../modules/instance'
import { ObjectId } from 'mongodb'
import { deployInstanceQueueProducer } from '../../queue/producers/instanceProducers'
import { InstanceSocketEvents } from 'types/sockets'

export default class InstanceSocket {
  data?: any
  event?: string
  name: string
  constructor(data?: any, event?: string) {
    this.data = data
    this.event = event
    this.name = constants.SOCKET_ROUTES.INSTANCE
  }

  events = {
    [constants.SOCKET_EVENTS.UPDATE_INSTANCE_CLIENT_DATA]: () => this.updateInstanceData(),
    [constants.SOCKET_EVENTS.CREATE_INSTANCE_CLIENT]: () => this.createInstanceClient(),
    [constants.SOCKET_EVENTS.INSTANCE_DELETE]: () => this.deleteInstance(),
    [InstanceSocketEvents.DEPLOY_INSTANCE]: () => this.deployInstance(),
  }

  async getClient(instanceId: ObjectId | string, ignoreDBStatus?: boolean) {
    const payload: { _id: ObjectId; status?: { $in: instanceDbStatus[] } } = {
      _id: new ObjectId(instanceId),
    }
    if (!ignoreDBStatus) {
      payload.status = {
        $in: [instanceDbStatus.ACTIVE, instanceDbStatus.PENDING_DEPLOYMENT, instanceDbStatus.PENDING_REMOVAL],
      }
    }

    const instance = await db.managementDb?.collection<IInstance>('instances').findOne(payload)

    if (!instance) throw new Error('Instance not found')

    const client =
      clients.instance[this.data?.instance_id] ||
      (() => {
        const client = new Instance(instance)
        client.addToClients()
        return client
      })()
    await client.updateInstanceDetails()
    return client
  }

  async updateInstanceData() {
    console.log('Updating instance data')
    await this.getClient(this.data?.instance_id)
  }

  async deleteInstance() {
    console.log('Deleting instance')
    if (!this.data?.instance_id) return
    const client = await this.getClient(this.data?.instance_id, true)
    await client.deleteInstance()
  }

  async createInstanceClient() {
    console.log('Creating instance client')
    await this.getClient(this.data?.instance_id)
  }

  async deployInstance() {
    await deployInstanceQueueProducer(this.data)
  }
}
