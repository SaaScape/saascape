import { ObjectId } from "mongodb"
import { db } from "../db"
import IInstance from "../schemas/Instances"
import constants from "../helpers/constants"

export default class InstanceService {
  applicationId: ObjectId
  constructor(applicationId: ObjectId) {
    this.applicationId = applicationId
  }

  async getInstancesStats() {
    const instanceData = await db.managementDb
      ?.collection<IInstance>("instances")
      .aggregate([
        {
          $match: {
            application_id: this.applicationId,
            status: constants.STATUSES.ACTIVE_STATUS,
          },
        },
        { $group: { _id: "$service_status", count: { $count: {} } } },
      ])
      .toArray()

    const responseObj: { [key: string]: any; totalInstances: number } = {
      totalInstances: 0,
    }

    for (const obj of instanceData || []) {
      const { _id: serviceStatus, count } = obj
      responseObj[serviceStatus] = count
      responseObj.totalInstances += count
    }

    return { instancesData: responseObj }
  }

  async findMany() {
    const instances = await db.managementDb
      ?.collection<IInstance>("instances")
      .aggregate([
        {
          $match: {
            application_id: this.applicationId,
            status: constants.STATUSES.ACTIVE_STATUS,
          },
        },
        {
          $lookup: {
            from: "versions",
            localField: "version_id",
            foreignField: "_id",
            as: "version",
          },
        },
        {
          $set: {
            version: { $first: "$version" },
          },
        },
      ])
      .toArray()

    return {
      instances,
    }
  }

  async findOne(instanceId: ObjectId) {
    return {
      instance: {},
    }
  }

  async create(data: any) {
    const { version_id, swarm_id, name, is_custom_database, database } = data

    // Check if instance already exists with the same name
    const foundInstance = await db.managementDb
      ?.collection<IInstance>("instances")
      .countDocuments({ name, status: constants.STATUSES.ACTIVE_STATUS })

    if (!!foundInstance) {
      throw { showError: "Instance already exists" }
    }

    const payload: IInstance = {
      _id: new ObjectId(),
      name,
      service_status: "pre-configured",
      config: {
        environment_variables: {},
        secrets_config: {},
      },
      is_custom_database,
      database: is_custom_database ? database : new ObjectId(database),
      version_id: new ObjectId(version_id),
      application_id: this.applicationId,
      status: constants.STATUSES.ACTIVE_STATUS,
      swarm_id: new ObjectId(swarm_id),
      created_at: new Date(),
      updated_at: new Date(),
    }

    const instance = await db.managementDb
      ?.collection<IInstance>("instances")
      .findOneAndReplace(
        {
          _id: payload._id,
          application_id: this.applicationId,
          status: constants.STATUSES.ACTIVE_STATUS,
        },
        payload,
        {
          upsert: true,
          returnDocument: "after",
        }
      )

    return {
      instance,
    }
  }

  async update() {}
}
