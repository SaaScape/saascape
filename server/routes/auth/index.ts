import express, { NextFunction, Request, Response } from "express"
import { sendErrorResponse, sendSuccessResponse } from "../../helpers/responses"
import cookieParser from "cookie-parser"
import IError from "../../interfaces/error"
import { AuthService } from "../../services/authService"
import { ObjectId } from "mongodb"

export default (app: express.Application) => {
  const use =
    (fn: (req: Request, res: Response, next: NextFunction) => any) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next)

  const router = express.Router()
  router.use(express.json())
  router.use(cookieParser())

  app.use("/auth", router)

  router.get("/", use(getIndex))

  //  ROUTE IMPORTS -----------------------

  // END ROUTE IMPORTS ---------------------

  router.use(catchError)
}

const catchError = async (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  sendErrorResponse(err, req, res)
}

const getIndex = async (req: Request, res: Response) => {
  sendSuccessResponse({ message: "hello auth" }, req, res)
}

const login = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { userAccount, accessToken, refreshToken } = await authService.login(
    req.body
  )
  res.cookie("accessToken", accessToken, { httpOnly: true })
  sendSuccessResponse({ userAccount, refreshToken }, req, res)
}
const tokenLogin = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { userAccount, accessToken } = await authService.refreshLogin(req.body)
  res.cookie("accessToken", accessToken, { httpOnly: true })
  sendSuccessResponse({ userAccount }, req, res)
}
const checkAuth = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { userObj } = await authService.getAuthDetails(req)
  sendSuccessResponse({ authenticated: true, userObj }, req, res)
}
const renewAccessToken = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { accessToken } = await authService.renewAccessToken(req)
  res.cookie("accessToken", accessToken, { httpOnly: true })
  sendSuccessResponse({ authenticated: true }, req, res)
}
