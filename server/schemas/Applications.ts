import { Document, ObjectId } from "mongodb"
import {
  IEncryptedData,
  ILinkedIdEnabledDocument,
} from "../interfaces/interfaces"

export type ContactType = "tenant" | "lead"

export interface ICustomField {
  _id: ObjectId
  field: string
  type: string
  label: string
  options?: string[]
}

export interface IApplicationConfig {
  version_config: {
    docker_hub_username: IEncryptedData
    docker_hub_password: IEncryptedData
  }
}

export interface IApplication extends Document, ILinkedIdEnabledDocument {
  application_name: string
  status: string
  description: string
  custom_fields: ICustomField[]
  config: IApplicationConfig
  created_at: Date
  updated_at: Date
}
