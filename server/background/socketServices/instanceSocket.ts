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
    [constants.SOCKET_EVENTS.DEPLOY_INSTANCE]: () => this.deployInstance(),
  }

  async updateInstanceData() {
    console.log('Updating instance data')
    if (clients.instance[this.data?.instance_id]) {
      await clients.instance[this.data?.instance_id]?.updateInstanceDetails()
    } else {
      const instance = await db.managementDb
        ?.collection<IInstance>('instances')
        .findOne({ _id: this.data?.instance_id, status: instanceDbStatus.ACTIVE })
      if (!instance) return
      new Instance(instance).addToClients()
    }
  }

  async deleteInstance() {
    console.log('Deleting instance')
    if (!this.data?.instance_id) return
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      .findOne({ _id: new ObjectId(this.data?.instance_id) })
    if (!instance) return
    const client = clients.instance[this.data?.instance_id] || new Instance(instance)
    await client.getServiceData()
    await client.deleteInstance()
  }

  async createInstanceClient() {
    console.log('Creating instance client')
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      .findOne({ _id: this.data?.instance_id, status: instanceDbStatus.ACTIVE })
    if (!instance) return
    new Instance(instance).addToClients()
  }

  async deployInstance() {
    await deployInstanceQueueProducer(this.data)
  }
}
