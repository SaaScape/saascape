import { ObjectId } from "mongodb"

export default interface IVersion {
  _id: ObjectId
  namespace: string
  repository: string
  tag: string
  created_at: Date
  updated_at: Date
}
