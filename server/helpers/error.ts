import { ObjectId } from "mongodb"
import { db } from "../db"
import { IError } from "../schemas/Errors"

export interface IErrorLogger {
  error: Object
  entityId?: string | ObjectId
  status: string
  module: string
  event: string
}

export const logError = async (error: IErrorLogger) => {
  const { error: errorObj, status, module, event, entityId } = error
  const stringifiedError = JSON.stringify(errorObj)

  await db.managementDb?.collection<IError>("errors").insertOne({
    error: stringifiedError,
    entity_id: new ObjectId(entityId),
    module,
    status,
    event,
    created_at: new Date(),
    updated_at: new Date(),
  })
}
