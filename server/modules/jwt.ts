import jwt from "jsonwebtoken"
import { ITokenObj } from "../interfaces/interfaces"

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

type ITokenResponse = (token: string) => Promise<ITokenObj>
type ITokenStringResponse = (payload: ITokenObj) => Promise<string>

class JWT {
  createJwt: {
    access: ITokenStringResponse
    refresh: ITokenStringResponse
  }
  decipherJwt: {
    access: ITokenResponse
    refresh: ITokenResponse
  }
  constructor() {
    this.createJwt = {
      access: async (payload: ITokenObj) => this.generateJwt(payload, "access"),
      refresh: async (payload: ITokenObj) =>
        this.generateJwt(payload, "refresh"),
    }
    this.decipherJwt = {
      access: (token: string) => this.verifyJwt(token, "access"),
      refresh: (token: string) => this.verifyJwt(token, "refresh"),
    }
  }

  private async verifyJwt(token: string, type: "access" | "refresh") {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET)
      throw new Error("Missing JWT environment variables")
    const verifyResult: string | jwt.JwtPayload | undefined = await new Promise(
      (resolve, reject) => {
        jwt.verify(
          token,
          type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET,
          (error, value) => {
            if (error) reject(error)
            resolve(value)
          }
        )
      }
    )
    return verifyResult as ITokenObj
  }
  private async generateJwt(payload: {}, type: "access" | "refresh") {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET)
      throw new Error("Missing JWT environment variables")

    const token = jwt.sign(
      payload,
      type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET,
      {
        expiresIn: type === "access" ? "15m" : "30 days",
      }
    )

    return token
  }
}

const jwtHelper = new JWT()

export default jwtHelper
