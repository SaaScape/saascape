/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import Pagination from '../helpers/pagination'
import { GlobalStatuses } from 'types/enums'

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
}
