import { ObjectId } from "mongodb"
import { db } from "../db"
import { IPlan } from "../schemas/Plans"
import constants from "../helpers/constants"
import Pagination from "../helpers/pagination"
import { IQuery } from "../interfaces/pagination"
import { checkForMissingParams } from "../helpers/utils"

export default class PlanService {
  applicationId: string
  constructor(query: any) {
    this.applicationId = query?.applicationId
  }
  async findMany(query: IQuery) {
    const pagination = new Pagination(query)
    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
    }
    this.applicationId &&
      (findObj["application_id"] = new ObjectId(this.applicationId))

    const plans = await pagination.runPaginatedQuery({
      collection: db?.managementDb?.collection("plans"),
      findObj,
    })

    return {
      plans,
    }
  }

  async createPlan(data: IPlan) {
    if (!this.applicationId)
      throw { showError: "Missing required param: applicationId" }
    const {
      plan_name,
      billing_interval,
      billing_interval_count,
      currency,
      price,
    } = data

    checkForMissingParams(data, [
      "plan_name",
      "billing_interval",
      "billing_interval_count",
      "currency",
      "price",
    ])

    //   Check if plan exists
    const plans =
      (await db.managementDb
        ?.collection<IPlan>("plans")
        .countDocuments({
          plan_name,
          application_id: new ObjectId(this.applicationId),
        })) || 0

    if (plans > 0) {
      throw { showError: "Plan already exists" }
    }

    const payload: IPlan = {
      application_id: new ObjectId(this.applicationId),
      plan_name,
      billing_interval,
      billing_interval_count,
      status: constants.STATUSES.ACTIVE_STATUS,
      currency,
      price,
      linked_ids: [],
      created_at: new Date(),
      updated_at: new Date(),
    }

    const plan = await db.managementDb
      ?.collection<IPlan>("plans")
      .findOneAndUpdate(
        { plan_name: plan_name },
        { $set: { ...payload } },
        {
          upsert: true,
          returnDocument: "after",
        }
      )
    return { plan }
  }
}
