/*
 * Copyright SaaScape (c) 2024.
 */

import { Document, ObjectId } from 'mongodb'
import { IEncryptedData, ILinkedIdEnabledDocument } from '../../server/interfaces/interfaces'

export type ContactType = 'tenant' | 'lead'

export interface ICustomField {
  _id: ObjectId
  field: string
  type: string
  label: string
  options?: string[]
}

export interface ISecret {
  _id: ObjectId
  name: string
  value: IEncryptedData
  docker_secret_id?: string
}

export interface IEnvironmentVariable {
  _id: ObjectId
  name: string
  value: string
}

export interface IEnvironmentVariablesConfig {
  [key: string]: IEnvironmentVariable
}

export interface ISecretsConfig {
  [key: string]: ISecret
}

interface IDeploymentGroups {
  [id: string]: IDeploymentGroup
}

export interface IDeploymentGroup {
  _id: ObjectId
  name: string
}

export interface IApplicationConfig {
  version_config: {
    docker_hub_username?: IEncryptedData
    docker_hub_password?: IEncryptedData
    docker_hub_webhooks?: boolean
    namespace?: string
    repository?: string
  }
  secrets_config: ISecretsConfig
  environment_config: IEnvironmentVariablesConfig
  nginx: {
    directives?: string
  }
  deployment_groups?: IDeploymentGroups
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
