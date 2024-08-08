/*
 * Copyright SaaScape (c) 2024.
 */

import { clients } from '../clients/clients'
import { DeploymentStatus, IDeployment } from 'types/schemas/Deployments'
import { db } from '../db'
import { ObjectId } from 'mongodb'
import { startDeploymentQueueProducer } from '../queue/producers/deploymentProducers'
import { initializeDeploymentWorker } from '../queue/workers/deploymentWorkers'

export default class Deployment {
  deployment: IDeployment
  constructor(deployment: IDeployment) {
    this.deployment = deployment
  }

  async updateDeploymentStatus(status: DeploymentStatus) {
    const payload = {
      deployment_status: status,
      updated_at: new Date(),
    }

    await db.managementDb?.collection<IDeployment>('deployments').updateOne(
      { _id: this.deployment?._id },
      {
        $set: payload,
      },
    )
  }

  async updateTargetStatus(status: DeploymentStatus, targetId: string) {
    const payload: { [key: string]: any } = {
      'targets.$[target].deployment_status': status,
      'targets.$[target].updated_at': new Date(),
    }

    if (status === DeploymentStatus.FAILED) {
      payload['targets.$[target].failed_at'] = new Date()
      payload['targets.$[target].completed_at'] = new Date()
    } else if (status === DeploymentStatus.COMPLETED) {
      payload['targets.$[target].completed_at'] = new Date()
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

  async finishSingleInstanceDeployment(targetId: string, status: DeploymentStatus.FAILED | DeploymentStatus.COMPLETED) {
    const payload: { [key: string]: any } = {
      'targets.$[target].deployment_status': status,
      'targets.$[target].updated_at': new Date(),
      'targets.$[target].completed_at': new Date(),
    }
    if (status === DeploymentStatus.FAILED) {
      payload['targets.$[target].failed_at'] = new Date()
    }

    await db.managementDb?.collection<IDeployment>('deployments').updateOne(
      { _id: this.deployment?._id },
      {
        $set: payload,
      },
      {
        arrayFilters: [
          {
            'target._id': new ObjectId(targetId),
          },
        ],
      },
    )
  }

  async deploymentFinished() {
    console.log('Deployment finished', this.deployment?._id.toString())
    await this.updateDeploymentDetails()

    // Check status of targets
    console.log(this.deployment?.targets)

    // If any failures then we need to mark deployment as failed
    await this.updateDeploymentStatus(DeploymentStatus.COMPLETED)

    //   Send socket update to server which will then forward onto FE.
  }
}
