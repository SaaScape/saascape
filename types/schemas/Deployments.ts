/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { GlobalStatuses } from '../enums'

export enum DeploymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  RUNNING = 'running',
  FAILED = 'failed',
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
  user_id: ObjectId
  created_at: Date
  updated_at: Date
}
