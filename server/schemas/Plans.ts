/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Document, ObjectId } from "mongodb"
import { ILinkedIdEnabledDocument } from "../interfaces/interfaces"

export interface IPlan extends Document, ILinkedIdEnabledDocument {
  plan_name: string
  billing_interval: string
  billing_interval_count: number
  currency: string
  status: string
  application_id: ObjectId
  price: number
  additional_configuration?: { property: string; value: string }[]
  addon_plans: IAddonPlan[]
  created_at: Date
  updated_at: Date
}

export interface IAddonPlan extends Document, ILinkedIdEnabledDocument {
  plan_name: string
  status: string
  price: number
  additional_configuration?: { property: string; value: string }[]
  created_at: Date
  updated_at: Date
}
