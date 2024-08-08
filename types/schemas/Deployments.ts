/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { GlobalStatuses } from '../enums'
import IInstance from './Instances'

export enum DeploymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  RUNNING = 'running',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export interface TargetInstance {
  _id: ObjectId
  instance_id: ObjectId
  instance_name: string
  deployment_status: DeploymentStatus
  updated_at: Date
  failed_at?: Date
  completed_at?: Date
}

export interface IDeployment {
  _id: ObjectId
  name: string
  description: string
  deployment_group: ObjectId
  version: ObjectId
  deployment_status: DeploymentStatus
  status: GlobalStatuses
  application_id: ObjectId
  targets: TargetInstance[]
  user_id: ObjectId
  created_at: Date
  updated_at: Date
}
