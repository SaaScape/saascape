/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'

export enum notificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  MESSAGE = 'message',
}

export interface INotification {
  _id: string | ObjectId
  title: string
  body: string
  type: notificationType
  read: boolean
  delete_on: Date
  from: 'system' | ObjectId
  to: ObjectId
  link?: string
  createdAt: Date
  updatedAt: Date
}
