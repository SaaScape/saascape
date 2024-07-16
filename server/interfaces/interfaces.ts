/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'

export interface ITokenObj {
  _id: string
}

export interface ILinkedId {
  _id: ObjectId | string
  name: string // Name of the integration
  integration_id?: ObjectId
  id?: string
}
export interface ILinkedIdEnabledDocument {
  linked_ids: ILinkedId[]
}

export interface IEncryptedData {
  iv: string
  encryptedData: string
}
