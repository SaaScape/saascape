/*
 * Copyright SaaScape (c) 2024.
 */

import { clients } from '../clients/clients'
import {
  DeploymentInstanceUpdateSocketData,
  DeploymentStatus,
  DeploymentUpdateSocketData,
  IDeployment,
} from 'types/schemas/Deployments'
import { db } from '../db'
import { ObjectId } from 'mongodb'
import { startDeploymentQueueProducer } from '../queue/producers/deploymentProducers'
import { initializeDeploymentWorker } from '../queue/workers/deploymentWorkers'
import { socket } from '../background/init/sockets'
import { DeploymentEvents } from 'types/sockets'
import moment from 'moment'

export default class Deployment {
  deployment: IDeployment
  constructor(deployment: IDeployment) {
    this.deployment = deployment
  }

  async updateDeploymentStatus(status: DeploymentStatus) {
    const thisMoment = moment()

    const payload: { [key: string]: any } = {
      deployment_status: status,
      updated_at: thisMoment.toDate(),
    }

    await db.managementDb?.collection<IDeployment>('deployments').updateOne(
      { _id: this.deployment?._id },
      {
        $set: payload,
      },
    )

    const socketData: DeploymentUpdateSocketData = {
      deploymentId: this.deployment?._id.toString(),
      status,
      updated_at: payload.updated_at,
    }

    socket?.emit(DeploymentEvents.DEPLOYMENT_UPDATED, socketData)
  }

  async updateTargetStatus(status: DeploymentStatus, targetId: string) {
    const thisMoment = moment()

    const prePayload: { [key: string]: any } = {
      updated_at: thisMoment.toDate(),
      completed_at: thisMoment.toDate(),
      failed_at: thisMoment.toDate(),
      deployment_status: status,
    }

    const payload: { [key: string]: any } = {
      'targets.$[target].deployment_status': prePayload.deployment_status,
      'targets.$[target].updated_at': prePayload.updated_at,
    }

    if (status === DeploymentStatus.FAILED) {
      payload['targets.$[target].failed_at'] = prePayload.failed_at
      payload['targets.$[target].completed_at'] = prePayload.completed_at
    } else if (status === DeploymentStatus.COMPLETED) {
      payload['targets.$[target].completed_at'] = prePayload.completed_at
    }

    const arrayFilters = [{ 'target._id': new ObjectId(targetId) }]

    await db.managementDb?.collection<IDeployment>('deployments').updateOne(
      { _id: this.deployment?._id },
      {
        $set: payload,
      },
      {
        arrayFilters,
      },
    )

    const socketData: DeploymentInstanceUpdateSocketData = {
      deploymentId: this.deployment?._id.toString(),
      targetId,
      status,
      updated_at: prePayload.updated_at,
    }

    if (status === DeploymentStatus.COMPLETED) {
      socketData['completed_at'] = prePayload.completed_at
    } else if (status === DeploymentStatus.FAILED) {
      socketData['failed_at'] = prePayload.failed_at
    }

    socket?.emit(DeploymentEvents.DEPLOYMENT_INSTANCE_UPDATED, socketData)
  }

  addToClients() {
    console.log('Adding deployment to client')
    clients.deployment[this.deployment?._id?.toString()] = this
  }

  removeFromClients() {
    console.log('Removing deployment from client')
    delete clients.deployment[this.deployment?._id?.toString()]
  }

  async updateDeploymentDetails() {
    // This method will be called to get latest service data from the db and service this is called when the instance is updated or every 1 hour by cron

    const payload: { _id: ObjectId } = {
      _id: this.deployment?._id,
    }

    const deployment = (
      await db.managementDb
        ?.collection<IDeployment>('deployments')
        .aggregate([{ $match: payload }])
        .toArray()
    )?.[0] as IDeployment

    if (!deployment) {
      this.removeFromClients()
      return
    }
    this.deployment = deployment
  }

  async startDeploymentWorker() {
    await initializeDeploymentWorker(this.deployment?._id?.toString())
  }

  async startDeployment() {
    console.log('Starting deployment', this.deployment?._id.toString())
    await this.updateDeploymentStatus(DeploymentStatus.RUNNING)
    for (const targetInstance of this.deployment?.targets || []) {
      await startDeploymentQueueProducer(this.deployment?._id?.toString(), {
        _id: targetInstance._id?.toString(),
        deploymentId: this.deployment._id.toString(),
      })
    }
    await this.startDeploymentWorker()
  }

  async finishSingleInstanceDeployment(
    targetId: string,
    status: DeploymentStatus.FAILED | DeploymentStatus.COMPLETED,
    isLastJob: boolean = false,
  ) {
    await this.updateTargetStatus(status, targetId)

    if (isLastJob) await this.deploymentFinished()
  }

  async deploymentFinished() {
    console.log('Deployment finished', this.deployment?._id.toString())
    await this.updateDeploymentDetails()

    const hasFailures = this.deployment?.targets?.some((target) => target.deployment_status === DeploymentStatus.FAILED)

    await this.updateDeploymentStatus(hasFailures ? DeploymentStatus.FAILED : DeploymentStatus.COMPLETED)
  }
}
