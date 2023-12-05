import express, { NextFunction, Request, Response } from "express"
import { sendErrorResponse, sendSuccessResponse } from "../../helpers/responses"
import cookieParser from "cookie-parser"
import IError from "../../interfaces/error"
import { AuthService } from "../../services/authService"
import withAuth from "../../middleware/withAuth"

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
  router.post("/login", use(login))
  router.post("/token-login", use(tokenLogin))
  router.get("/check-auth", use(withAuth), use(checkAuth))
  router.put("/renew-token", use(renewAccessToken))

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
    req.body,
    req
  )
  const { permissions } = req
  res.cookie("accessToken", accessToken, { httpOnly: true })
  console.log(permissions)
  sendSuccessResponse({ userAccount, permissions, refreshToken }, req, res)
}
const tokenLogin = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { userAccount, accessToken } = await authService.refreshLogin(
    req.body,
    req
  )
  const { permissions } = req
  res.cookie("accessToken", accessToken, { httpOnly: true })
  sendSuccessResponse({ userAccount, permissions }, req, res)
}
const checkAuth = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { userObj } = await authService.getAuthDetails(req)
  const { permissions } = req
  sendSuccessResponse({ authenticated: true, userObj, permissions }, req, res)
}
const renewAccessToken = async (req: Request, res: Response) => {
  const authService = new AuthService()
  const { accessToken } = await authService.renewAccessToken(req)
  res.cookie("accessToken", accessToken, { httpOnly: true })
  sendSuccessResponse({ authenticated: true }, req, res)
}
