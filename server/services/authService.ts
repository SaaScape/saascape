import { ObjectId } from "mongodb"
import { db } from "../db"
import constants from "../helpers/constants"
import messages from "../helpers/messages"
import { cleanUserObj } from "../helpers/sanitization"
import { ITokenObj } from "../interfaces/interfaces"
import { comparePassword } from "../modules/bcrypt"
import jwtHelper from "../modules/jwt"
import { IUser } from "../schemas/Users"
import { Request } from "express"
export class AuthService {
  constructor() {}
  async login(body: { username: string; password: string }) {
    const { username, password } = body

    const userAccount = (
      await db.managementDb
        ?.collection<IUser>("users")
        .aggregate([
          {
            $match: {
              email: username,
              status: constants.STATUSES.ACTIVE_STATUS,
            },
          },
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
    )?.[0] as IUser

    if (!userAccount) throw { showError: messages.UNABLE_TO_FIND_USER_ACCOUNT }

    const passwordCorrect = await comparePassword(
      userAccount?.password,
      password
    )
    if (!passwordCorrect)
      throw { showError: messages.UNABLE_TO_FIND_USER_ACCOUNT }

    //   User has authenticated successfully

    const tokenObj: ITokenObj = {
      _id: userAccount?._id?.toString(),
    }

    // Get access token
    const accessToken = await jwtHelper.createJwt.access(tokenObj)
    const refreshToken = await jwtHelper.createJwt.refresh(tokenObj)

    // Update refreshTokens for user

    await db.managementDb?.collection<IUser>("users").updateOne(
      { _id: userAccount._id },
      {
        $push: {
          refresh_tokens: {
            $each: [{ ip: "", token: refreshToken }],
            $slice: -5,
          },
        },
      }
    )

    const cleanUserAccount = cleanUserObj(userAccount)

    return { userAccount: cleanUserAccount, refreshToken, accessToken }
  }

  async refreshLogin(body: { refreshToken: string }) {
    const { refreshToken } = body
    // Decipher token
    const verifyResult = await jwtHelper.decipherJwt.refresh(refreshToken)
    if (!verifyResult) throw { showError: "Invalid refresh token" }

    const { _id } = verifyResult

    const userAccount = (
      await db.managementDb
        ?.collection<IUser>("users")
        .aggregate([
          {
            $match: {
              _id: new ObjectId(_id),
              "refresh_tokens.token": refreshToken,
            },
          },
          {
            $lookup: {
              foreignField: "_id",
              from: "groups",
              localField: "groups",
              as: "groups",
            },
          },
        ])
        .toArray()
    )?.[0] as IUser

    if (!userAccount) throw { showError: messages.UNABLE_TO_FIND_USER_ACCOUNT }
    if (userAccount?.status !== constants.STATUSES.ACTIVE_STATUS)
      throw { showError: messages.USER_NOT_ACTIVE }

    const tokenObj: ITokenObj = {
      _id: userAccount?._id?.toString(),
    }

    const accessToken = await jwtHelper.createJwt.access(tokenObj)

    const cleanUserAccount = cleanUserObj(userAccount)

    return { userAccount: cleanUserAccount, accessToken }
  }

  async renewAccessToken(req: Request) {
    const {
      body: { refreshToken },
    } = req

    if (!refreshToken) throw { showError: "Missing refresh token from request" }

    // Decipher refresh token
    const tokenData = await jwtHelper.decipherJwt.refresh(refreshToken)
    if (!tokenData) throw { showError: "Invalid/expired refresh token" }
    const { _id } = tokenData as ITokenObj

    const userObj = await db.managementDb?.collection<IUser>("users").findOne({
      _id: new ObjectId(_id),
      status: constants.STATUSES.ACTIVE_STATUS,
      "refresh_tokens.token": refreshToken,
    })

    if (!userObj) throw { showError: "Unable to find refresh token in DB" }

    const accessToken = await jwtHelper.createJwt.access({
      _id: _id.toString(),
    })

    return { accessToken }
  }

  async getAuthDetails(req: Request) {
    const { userObj } = req
    const cleanUserAccount = cleanUserObj(userObj)
    return { userObj: cleanUserAccount }
  }
}
