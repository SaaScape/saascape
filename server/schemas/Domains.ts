import { Document } from "mongodb"

export interface IDomain extends Document {
  domain_name: string
  status: string
  created_at: Date
  updated_at: Date
}
