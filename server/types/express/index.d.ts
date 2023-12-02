import { IPermissions } from "../../schemas/Permissions"
import { IUser } from "../../schemas/Users"
declare global {
  namespace Express {
    interface Request {
      userObj: IUser
      permissions: string[]
    }
  }
}
