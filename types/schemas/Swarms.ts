/*
 * Copyright SaaScape (c) 2024.
 */

import { Document } from 'mongodb'
import { IEncryptedData } from '../../server/interfaces/interfaces'

export interface ISwarm extends Document {
  name: string
  ID: string
  join_tokens: {
    worker: IEncryptedData
    manager: IEncryptedData
  }
  created_at: Date
  updated_at: Date
}
