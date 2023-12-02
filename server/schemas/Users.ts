import { ObjectId } from "mongodb"
import { IPermissions } from "./Permissions"

export interface ICleanUser {
  _id: ObjectId
  username: string
  first_name: string
  last_name: string
  email: string
  groups: ObjectId[]
  status: string
  created_at: Date
  updated_at: Date
}
export interface IUser extends ICleanUser {
  password: string
  refresh_tokens?: IRefreshToken[]
}

interface IRefreshToken {
  ip: string
  token: string
}

export interface IUserWithPermissions extends IUser {
  permissions: IPermissions[]
}
