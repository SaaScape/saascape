import { NextFunction, Request, Response } from "express"

// Middleware to check if user permissions matches requested perms
export default (permissions: String[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { permissions: userPermissions } = req
    if (!userPermissions?.length)
      throw { showError: "Missing required permissions", status: 401 }

    //   check if admin
    if (userPermissions.includes("super_access")) return next()

    for (const permission of userPermissions) {
      if (permissions.includes(permission)) {
        return next()
      }
    }

    throw { showError: "Unauthorized", status: 401 }
  }
