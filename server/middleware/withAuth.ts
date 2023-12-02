// Check if req is authenticated

import { NextFunction, Request, Response } from "express"
import messages from "../helpers/messages"
import constants from "../helpers/constants"
import { ObjectId } from "mongodb"
import { db } from "../db"
import jwtHelper from "../modules/jwt"
import { IUser, IUserWithPermissions } from "../schemas/Users"

const getPermissions = (req: Request) => {
  const { userObj } = req
  if (!userObj?._id) throw new Error("Missing _id from userObj in request")

  const perms = new Set(
    (userObj as IUserWithPermissions)?.permissions?.map(
      (obj) => obj.permission_name
    )
  )
  req.permissions = new Array(...perms)
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const {
    cookies: { accessToken },
  } = req

  if (!accessToken)
    throw { message: "Missing access token from request", status: 401 }

  // Decipher token
  const verifyResult = await jwtHelper.decipherJwt.access(accessToken)

  if (!verifyResult) throw { showError: "Invalid refresh token", status: 401 }

  const { _id } = verifyResult

  const userAccount = (
    await db.managementDb
      ?.collection<IUser>("users")
      .aggregate([
        { $match: { _id: new ObjectId(_id) } },
        {
          $lookup: {
            foreignField: "_id",
            from: "groups",
            localField: "groups",
            as: "groups",
          },
        },
        {
          $lookup: {
            foreignField: "_id",
            from: "permissions",
            localField: "groups.permissions",
            as: "permissions",
          },
        },
      ])
      .toArray()
  )?.[0] as IUserWithPermissions

  if (!userAccount) throw { showError: messages.UNABLE_TO_FIND_USER_ACCOUNT }
  if (userAccount?.status !== constants.STATUSES.ACTIVE_STATUS)
    throw { showError: messages.USER_NOT_ACTIVE, status: 401 }

  req.userObj = userAccount

  getPermissions(req)
  return next()
}
