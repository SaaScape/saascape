import { Document, ObjectId } from "mongodb"

export interface IDomain extends Document {
  domain_name: string
  status: string
  description: string
  linked_servers: { server_id: ObjectId; status: string; last_sync: Date }[]
  created_at?: Date
  updated_at: Date
}
