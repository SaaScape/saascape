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
  SSL?: {
    status: DomainSSLStatus
    challenge_token?: string
    challenge_auth_key?: string
    certificates?: {
      cert: IEncryptedData
      key: IEncryptedData
      csr: IEncryptedData
    }
  }
  created_at?: Date
  updated_at: Date
}
