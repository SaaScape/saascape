import { Document, ObjectId } from "mongodb"
import { ILinkedIdEnabledDocument } from "../interfaces/interfaces"

export interface IPlan extends Document, ILinkedIdEnabledDocument {
  plan_name: string
  billing_interval: string
  billing_interval_count: number
  currency: string
  status: string
  application_id: ObjectId
  price: number
  additional_configuration?: { property: string; value: string }[]
  created_at: Date
  updated_at: Date
}
