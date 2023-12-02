import { ObjectId } from "mongodb"

export interface IPermissions {
  _id: ObjectId
  permission_name: string
  description: string
}
