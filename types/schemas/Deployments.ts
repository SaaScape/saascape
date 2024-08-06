/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { GlobalStatuses } from '../enums'

export interface IDeployment {
  _id: ObjectId
  name: string
  deployment_group: ObjectId
  version: ObjectId
  status: GlobalStatuses
  application_id: ObjectId
  created_at: Date
  updated_at: Date
}
