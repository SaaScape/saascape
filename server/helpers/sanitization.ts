import { Document } from "mongodb"
import { ICleanUser, IUser } from "../schemas/Users"

export const cleanUserObj = (userObj: IUser) => {
  const cleanUserObj: ICleanUser = {
    _id: userObj._id,
    username: userObj.username,
    first_name: userObj.first_name,
    last_name: userObj.last_name,
    email: userObj.email,
    groups: userObj.groups,
    status: userObj.status,
    created_at: userObj.created_at,
    updated_at: userObj.updated_at,
  }

  return cleanUserObj
}
