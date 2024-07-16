import { Document } from "mongodb"

export interface IError extends Document {
  error: string //JSON Stringified object
  status: string
  module: string
  event: string
  created_at: Date
  updated_at: Date
}
