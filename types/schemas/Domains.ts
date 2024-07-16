/*
 * Copyright SaaScape (c) 2024.
 */

import { Document, ObjectId } from 'mongodb'
import { SSLStatus } from '../enums'
import { IEncryptedData } from '../../server/interfaces/interfaces'

export type DomainSSLStatus = 'active' | 'pending_initialization' | 'initializing' | 'expiring' | 'expired'

export enum DomainStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export interface IDomain extends Document {
  domain_name: string
  status: DomainStatus
  description: string
  linked_servers: { server_id: ObjectId; status: string; last_sync: Date }[]
  enable_ssl: boolean
  DNS: {
    a_record: string
    last_updated: Date
  }
  SSL?: {
    status: SSLStatus
    challenge_token?: string
    challenge_auth_key?: string
    certificates?: {
      cert: IEncryptedData
      key: IEncryptedData
      csr: IEncryptedData
    }
    start_date?: Date
    end_date?: Date
  }
  created_at?: Date
  updated_at: Date
}
