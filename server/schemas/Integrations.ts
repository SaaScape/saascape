import { ObjectId } from "mongodb"

export interface IIntegration {
  _id: ObjectId
  name: string
  status: string
  created_at: Date
  updated_at: Date
  config: object
}
