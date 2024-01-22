import { Document } from "mongodb"

export interface IDomain extends Document {
  domain_name: string
  status: string
  description: string
  initialization_status: {
    status: string
    active_servers: string[]
    pending_servers: string[]
  }
  created_at?: Date
  updated_at: Date
}
