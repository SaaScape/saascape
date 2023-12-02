import { ObjectId } from "mongodb"

export interface IGroup {
  _id: ObjectId
  name: string
  permissions: ObjectId[]
}
