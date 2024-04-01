import { ObjectId } from "mongodb"
import { db } from "../db"
import constants from "../helpers/constants"
import { IApplication, ICustomField } from "../schemas/Applications"
import { encryptData } from "../helpers/utils"

interface IUpdateConfigData {
  configModule: "custom_fields" | "secrets" | "env_vars"
  fields: any
  [key: string]: any
}

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

  private async updateCustomFields(id: string, data: IUpdateConfigData) {
    const { fields } = data

    if (!Object.keys(fields || {}).length)
      throw { showError: "No fields have been changed!" }

    const bulkWrites = []

    for (const _id in fields) {
      switch (_id) {
        case "newFields":
          for (const newField in fields[_id]) {
            const insertObj: any = {
              updateOne: {
                filter: {
                  _id: new ObjectId(id),
                },
                update: {
                  $push: {},
                },
              },
            }
            const newFieldData = fields?.[_id]?.[newField]
            const payload: ICustomField = {
              _id: new ObjectId(),
              field: newFieldData?.field,
              type: newFieldData.type,
              label: newFieldData.label,
            }
            if (newFieldData?.type === "dropdown") {
              payload.options = newFieldData?.options
            }

            insertObj.updateOne.update.$push[`custom_fields`] = payload
            bulkWrites.push(insertObj)
          }
          break
        case "deleted":
          const deletedIds = Object.keys(fields[_id])?.map(
            (id) => new ObjectId(id)
          )
          const deleteObj: any = {
            updateOne: {
              filter: {
                _id: new ObjectId(id),
              },
              update: {
                $pull: { custom_fields: { _id: { $in: deletedIds } } },
              },
            },
          }
          bulkWrites.push(deleteObj)
          break
        default:
          const updateObj: any = {
            updateOne: {
              filter: {
                _id: new ObjectId(id),
              },
              update: {
                $set: {},
              },
              arrayFilters: [{ "field._id": new ObjectId(_id) }],
            },
          }
          for (const fieldKey in fields[_id]) {
            const updatePath = `custom_fields.$[field].${fieldKey}`

            updateObj.updateOne.update.$set[updatePath] = fields[_id][fieldKey]
          }
          bulkWrites.push(updateObj)
          break
      }
    }

    const res = await db.managementDb
      ?.collection<IApplication>("applications")
      ?.bulkWrite(bulkWrites)

    const latestApplication = await db.managementDb
      ?.collection<IApplication>("applications")
      ?.findOne({ _id: new ObjectId(id) })

    return latestApplication
  }

  private async updateVersionConfig(id: string, data: IUpdateConfigData) {
    const { docker_hub_username, docker_hub_password } = data

    const encryptedData = {
      docker_hub_username: encryptData(docker_hub_username),
      docker_hub_password: encryptData(docker_hub_password),
    }

    const application = await db.managementDb
      ?.collection<IApplication>("applications")
      ?.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { config: { version_config: encryptedData } } },
        { returnDocument: "after" }
      )

    return application
  }

  async updateConfig(id: string, data: IUpdateConfigData) {
    const application = await db.managementDb
      ?.collection<IApplication>("applications")
      ?.findOne({ _id: new ObjectId(id) })

    if (!application) {
      throw { showError: "Application not found" }
    }

    const { configModule } = data

    let result: any

    switch (configModule) {
      case constants.CONFIG_MODULES.CUSTOM_FIELDS:
        result = await this.updateCustomFields(id, data)
        return { application: result }
      case constants.CONFIG_MODULES.ENV_VARS:
        return { application }
      case constants.CONFIG_MODULES.SECRETS:
        return { application }
      case constants.CONFIG_MODULES.VERSION_CONFIG:
        result = await this.updateVersionConfig(id, data)
        return { application: result }
    }
  }
}
