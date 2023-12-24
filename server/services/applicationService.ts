import { ObjectId } from "mongodb"
import { db } from "../db"
import constants from "../helpers/constants"

export default class ApplicationService {
  constructor() {}

  async findMany() {
    const applications = await db.managementDb
      ?.collection("applications")
      .find({
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
      .toArray()

    return { applications }
  }
  async findOne(id: string) {
    const application = await db.managementDb
      ?.collection("applications")
      .findOne({ _id: new ObjectId(id) })
    return { application }
  }
  async deleteOne(id: string) {
    const application = await db.managementDb
      ?.collection("applications")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: constants.STATUSES.DELETED_STATUS } },
        { returnDocument: "after" }
      )

    return { application }
  }
  async create(data: any) {
    const foundApplication = await db.managementDb
      ?.collection("applications")
      .findOne({ application_name: data.application_name })
    if (foundApplication) {
      throw { showError: "Application already exists" }
    }

    const payload = {
      application_name: data.application_name,
      status: constants.STATUSES.ACTIVE_STATUS,
      description: data.description,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const application = await db.managementDb
      ?.collection("applications")
      .insertOne(payload)

    return { application }
  }
  async update(id: string, data: any) {
    const foundApplication = await db.managementDb
      ?.collection("applications")
      .findOne({ application_name: data.application_name })
    if (foundApplication) {
      throw { showError: "Application not found" }
    }

    const payload = {
      application_name: data.application_name,
      description: data.description,
      updated_at: new Date(),
    }

    const application = await db.managementDb
      ?.collection("applications")
      .updateOne({ _id: new ObjectId(id) }, { $set: payload })

    return { application }
  }
}
