import { Document } from "mongodb"
import { ILinkedIdEnabledDocument } from "../interfaces/interfaces"

export type ContactType = "tenant" | "lead"
export interface IContact extends Document, ILinkedIdEnabledDocument {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: {
    line1: string
    line2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  status: string
  contact_type: ContactType
  created_at: Date
  updated_at: Date
}
