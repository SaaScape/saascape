/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { IEnvironmentVariablesConfig, ISecretsConfig } from '../../server/schemas/Applications'
import IVersion from '../../server/schemas/Versions'
import { ILinkedIdEnabledDocument } from '../../server/interfaces/interfaces'
import { IDomain } from '../../server/schemas/Domains'

export enum instanceServiceStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed',
  CREATING = 'creating',
  PENDING = 'pending',
  PRE_CONFIGURED = 'pre-configured',
  CREATION_FAILED = 'creation-failed',
  CREATION_SUCCESS = 'creation-success',
}

export default interface IInstance extends ILinkedIdEnabledDocument {
  _id: ObjectId
  service_status: instanceServiceStatus
  name: string
  is_custom_database: boolean
  database: string | ObjectId
  port_assignment: 'auto' | 'manual'
  port: number
  replicas: number
  config: {
    environment_config: IEnvironmentVariablesConfig
    secrets_config: ISecretsConfig
  }
  tenant?: ObjectId | string
  version_id: ObjectId
  version?: IVersion
  application_id: ObjectId
  status: string
  swarm_id: ObjectId | string
  deployed_at?: Date | null
  tags?: string[]
  domain_id: ObjectId
  domain?: IDomain
  created_at: Date
  updated_at: Date
}

// linkedIds will contain an array of docker swarm service ids and swarm id
