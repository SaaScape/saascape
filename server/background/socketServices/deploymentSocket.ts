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
import { DeploymentEvents, InstanceSocketEvents } from 'types/sockets'
import { IDeployment } from 'types/schemas/Deployments'
import Deployment from '../../modules/deployment'

export default class DeploymentSocket {
  data?: any
  event?: string
  name: string
  constructor(data?: any, event?: string) {
    this.data = data
    this.event = event
    this.name = constants.SOCKET_ROUTES.DEPLOYMENT
  }

  events: { [event: string]: () => void } = {
    [DeploymentEvents.DEPLOYMENT_CREATED]: () => this.createDeployment(),
  }

  async getClient(deploymentId: ObjectId | string) {
    const payload: { _id: ObjectId } = {
      _id: new ObjectId(deploymentId),
    }

    // if (!ignoreDBStatus) {
    //   payload.status = {
    //     $in: [instanceDbStatus.ACTIVE, instanceDbStatus.PENDING_DEPLOYMENT, instanceDbStatus.PENDING_REMOVAL],
    //   }
    // }

    const deployment = (
      await db.managementDb
        ?.collection<IDeployment>('deployments')
        .aggregate([{ $match: payload }])
        .toArray()
    )?.[0] as IDeployment

    if (!deployment) throw new Error('Deployment not found')

    const client =
      clients.deployment[this.data?.deployment_id] ||
      (() => {
        const client = new Deployment(deployment)
        client.addToClients()
        return client
      })()

    await client.updateDeploymentDetails()
    return client
  }

  async createDeployment() {
    console.log('Creating deployment')
    console.log(this.data)
    const client = await this.getClient(this.data?.deployment_id)
    await client.startDeployment()
  }
}
