import { Document, ObjectId } from "mongodb"
import { IEncryptedData } from "../interfaces/interfaces"

export type DomainSSLStatus =
  | "active"
  | "pending_initialization"
  | "initializing"
  | "expiring"
  | "expired"
export interface IDomain extends Document {
  domain_name: string
  status: string
  description: string
  linked_servers: { server_id: ObjectId; status: string; last_sync: Date }[]
  enable_ssl: boolean
  DNS: {
    a_record: string
    last_updated: Date
  }
  SSL?: {
    status: DomainSSLStatus
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
