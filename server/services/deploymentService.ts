/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import Pagination from '../helpers/pagination'
import { GlobalStatuses } from 'types/enums'
import { DeploymentStatus, IDeployment } from 'types/schemas/Deployments'

interface IDeploymentService {
  CreateDeployment: {
    deployment: {
      name: string
      description: string
      deployment_group: string
      version_id: string
    }
  }
}

export default class DeploymentService {
  applicationId: ObjectId

  constructor(applicationId: string) {
    this.applicationId = new ObjectId(applicationId)
  }

  async findMany(query: any) {
    const pagination = new Pagination(query)
    const findObj: any = {
      status: GlobalStatuses.ACTIVE,
      application_id: this.applicationId,
    }

    if (query?.searchValue) {
      findObj['$or'] = [{ name: { $regex: query.searchValue, $options: 'i' } }]
    }

    const aggregationPipeline = [
      { $match: findObj },
      {
        $lookup: {
          from: 'versions',
          localField: 'version',
          foreignField: '_id',
          as: 'version_obj',
        },
      },
      {
        $set: {
          version_obj: { $first: '$version_obj' },
        },
      },
    ]

    const deployments = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection('deployments'),
      aggregationPipeline,
    })

    return { data: deployments }
  }

  async createDeployment(deployment: IDeploymentService['CreateDeployment']['deployment']) {
    const payload: IDeployment = {
      _id: new ObjectId(),
      version: new ObjectId(deployment.version_id),
      application_id: this.applicationId,
      name: deployment.name,
      description: deployment.description,
      status: GlobalStatuses.ACTIVE,
      deployment_group: new ObjectId(deployment.deployment_group),
      deployment_status: DeploymentStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const runningDeployment = await db.managementDb?.collection<IDeployment>('deployments').findOne({
      deployment_status: { $in: [DeploymentStatus.PENDING, DeploymentStatus.RUNNING] },
      application_id: this.applicationId,
      deployment_group: new ObjectId(deployment.deployment_group),
    })

    if (runningDeployment) {
      throw {
        showError: `Unable to create deployment ${deployment.name} since there is an active deployment for this group already in progress called '${runningDeployment?.name}'`,
      }
    }

    const insertObj = await db.managementDb
      ?.collection<IDeployment>('deployments')
      .findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' })

    return { deployment: insertObj }
  }
}
