/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { ObjectId } from "mongodb"
import { db } from "../db"
import { IAddonPlan, IPlan } from "../schemas/Plans"
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
    const plans = await db.managementDb?.collection<IPlan>("plans").findOne({
      plan_name,
      application_id: new ObjectId(this.applicationId),
    })

    if (plans) {
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
      addon_plans: [],
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

    const {
      plan_name,
      price,
      additional_configuration = [],
      isAddon = false,
      _id: addonPlanId,
    } = data

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
    if (isAddon) {
      const hasAddonWithSameName = planToBeUpdated?.addon_plans?.some(
        (plan) =>
          plan?.plan_name?.toLowerCase() === plan_name?.toLowerCase() &&
          plan?.status === constants.STATUSES.ACTIVE_STATUS &&
          plan?._id?.toString() !== addonPlanId
      )

      if (hasAddonWithSameName)
        throw { showError: "Addon plan with this name already exists" }

      const addonObj = planToBeUpdated?.addon_plans?.find(
        (plan) => plan?._id?.toString() === addonPlanId
      )

      let result
      if (addonObj) {
        console.log("updating addon plan")
        result = await db.managementDb?.collection<IPlan>("plans").updateOne(
          {
            _id: new ObjectId(_id),
            addon_plans: {
              $elemMatch: { _id: new ObjectId(addonPlanId) },
            },
          },
          {
            $set: {
              "addon_plans.$.plan_name": plan_name,
              "addon_plans.$.price": price,
              "addon_plans.$.additional_configuration":
                additional_configuration,
              "addon_plans.$.updated_at": new Date(),
            },
          }
        )
      } else {
        // Create new addon
        const payload: IAddonPlan = {
          _id: new ObjectId(),
          plan_name,
          status: constants.STATUSES.ACTIVE_STATUS,
          price,
          additional_configuration,
          linked_ids: [],
          created_at: new Date(),
          updated_at: new Date(),
        }
        result = await db.managementDb
          ?.collection<IPlan>("plans")
          ?.updateOne(
            { _id: new ObjectId(_id) },
            { $push: { addon_plans: payload } }
          )
      }

      if (!result) throw { showError: "Failed to update addon plan" }
      if (!result.modifiedCount)
        throw { showError: "Failed to update addon plan" }

      return { success: true }
    } else {
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
      return { success: true }
    }
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

  async removeAddonPlan(id: string, data: IPlan) {
    if (!this.applicationId)
      throw { showError: "Missing required param: applicationId" }
    const { addonPlanId } = data
    checkForMissingParams(data, ["addonPlanId"])

    // Find plan
    await this.findPlan(id)

    const updateResult = await db.managementDb
      ?.collection<IPlan>("plans")
      .updateOne(
        {
          _id: new ObjectId(id),
          addon_plans: {
            $elemMatch: { _id: new ObjectId(addonPlanId) },
          },
        },
        {
          $set: {
            "addon_plans.$.status": constants.STATUSES.DELETED_STATUS,
          },
        }
      )

    if (!updateResult?.modifiedCount)
      throw { showError: "Addon plan not deleted" }

    return { success: true }
  }
}
