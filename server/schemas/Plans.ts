/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

*/

import { Document, ObjectId } from "mongodb"
import { ILinkedIdEnabledDocument } from "../interfaces/interfaces"

type AdditionalConfiguration = {
  property: string
  value: string | number | boolean
}
export interface IPlan extends Document, ILinkedIdEnabledDocument {
  plan_name: string
  billing_interval: string
  billing_interval_count: number
  currency: string
  status: string
  application_id: ObjectId
  price: number
  additional_configuration?: AdditionalConfiguration[]
  addon_plans: IAddonPlan[]
  created_at: Date
  updated_at: Date
}

export interface IAddonPlan extends Document, ILinkedIdEnabledDocument {
  plan_name: string
  status: string
  price: number
  additional_configuration?: AdditionalConfiguration[]
  created_at: Date
  updated_at: Date
}
