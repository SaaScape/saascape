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
      additional_configuration = [],
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
      (await db.managementDb?.collection<IPlan>("plans").countDocuments({
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
      additional_configuration,
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
  async updatePlan(_id: string, data: IPlan) {
    if (!this.applicationId)
      throw { showError: "Missing required param: applicationId" }

    const { plan_name, price, additional_configuration = [] } = data

    checkForMissingParams(data, ["plan_name", "currency", "price"])

    // Get plan to be updated
    const planToBeUpdated = await db.managementDb
      ?.collection<IPlan>("plans")
      ?.findOne({
        _id: new ObjectId(_id),
        application_id: new ObjectId(this.applicationId),
      })

    if (!planToBeUpdated) {
      throw { showError: "Plan does not exist" }
    }

    // Check if plan name is in use

    const plansUsingName =
      (await db.managementDb?.collection<IPlan>("plans").countDocuments({
        plan_name,
        application_id: new ObjectId(this.applicationId),
        _id: { $ne: new ObjectId(_id) },
      })) || 0

    if (plansUsingName > 0) {
      throw { showError: "A plan with this name already exists" }
    }

    const payload = {
      plan_name,
      price,
      additional_configuration,
      updated_at: new Date(),
    }

    const updatedPlan = await db.managementDb
      ?.collection<IPlan>("plans")
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { ...payload } },
        {
          returnDocument: "after",
        }
      )
    return { updatedPlan }
  }

  async findPlan(id: string) {
    const findObj: {
      _id: ObjectId
      status: string
      application_id?: ObjectId
    } = {
      _id: new ObjectId(id),
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    if (this.applicationId)
      findObj["application_id"] = new ObjectId(this.applicationId)

    const plan = await db.managementDb
      ?.collection<IPlan>("plans")
      .findOne(findObj)

    if (!plan) throw { showError: "Plan not found" }
    return { plan }
  }

  async deletePlan(id: string) {
    if (!this.applicationId)
      throw { showError: "Missing required param: applicationId" }

    // Get plan to be deleted
    const planToBeDeleted = await db.managementDb
      ?.collection<IPlan>("plans")
      ?.findOne({
        _id: new ObjectId(id),
        application_id: new ObjectId(this.applicationId),
      })

    if (!planToBeDeleted) {
      throw { showError: "Plan does not exist" }
    }

    const updateResult = await db.managementDb
      ?.collection<IPlan>("plans")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: constants.STATUSES.DELETED_STATUS,
          },
        }
      )

    if (!updateResult) throw { showError: "Plan not deleted" }

    if (updateResult?.modifiedCount !== 1)
      throw { showError: "Plan not deleted" }

    return { success: true }
  }
}
