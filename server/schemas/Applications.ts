import { Document, ObjectId } from "mongodb"
import { ILinkedIdEnabledDocument } from "../interfaces/interfaces"

export type ContactType = "tenant" | "lead"

export interface ICustomField {
  _id: ObjectId
  field: string
  type: string
  label: string
  options?: string[]
}
export interface IApplication extends Document, ILinkedIdEnabledDocument {
  application_name: string
  status: string
  description: string
  custom_fields: ICustomField[]
  created_at: Date
  updated_at: Date
}
