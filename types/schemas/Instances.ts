/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { IEnvironmentVariablesConfig, ISecretsConfig } from './Applications'
import IVersion from '../../server/schemas/Versions'
import { ILinkedIdEnabledDocument } from '../../server/interfaces/interfaces'
import { IDomain } from './Domains'
import { instanceHealth, updateStatus } from '../enums'

export enum InstanceServiceStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed',
  CREATING = 'creating',
  PENDING = 'pending',
  PRE_CONFIGURED = 'pre-configured',
  CREATION_FAILED = 'creation-failed',
  CREATION_SUCCESS = 'creation-success',
  UNKNOWN = 'unknown',
  MIXED = 'mixed',
  STARTING = 'starting',
  READY = 'ready',
}

export interface IReplicaStates {
  [replica: number]: {
    health: instanceHealth
    state: string
    since: Date
  }
}

export enum instanceDbStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  PENDING_REMOVAL = 'pending_removal',
  PENDING_DEPLOYMENT = 'pending_deployment',
}

export interface IInstanceHealth {
  instance_id: string
  health: instanceHealth
  healthLastUpdated: Date
  instanceServiceStatus: InstanceServiceStatus
  replica_health: IReplicaStates
}
export interface IInstanceHealths {
  [instanceId: string]: IInstanceHealth
}

export default interface IInstance extends ILinkedIdEnabledDocument {
  _id: ObjectId
  service_status: InstanceServiceStatus
  service_health: instanceHealth
  service_health_updated_at: Date
  service_health_notified_at?: Date

  update_status: updateStatus
  update_status_updated_at?: Date
  name: string
  is_custom_database: boolean
  database: string | ObjectId
  port_assignment: 'auto' | 'manual'
  port: number
  replicas: number
  replica_health?: IReplicaStates
  config: {
    environment_config: IEnvironmentVariablesConfig
    secrets_config: ISecretsConfig
    run_command?: string[]
    volumes?: string[]
  }
  deployment_group?: ObjectId
  tenant?: ObjectId | string
  version_id: ObjectId
  version?: IVersion
  application_id: ObjectId
  status: instanceDbStatus
  swarm_id: ObjectId | string
  deployed_at?: Date | null
  tags?: string[]
  domain_id?: ObjectId
  domain?: IDomain
  created_at: Date
  updated_at: Date
}

// linkedIds will contain an array of docker swarm service ids and swarm id
