import express, { NextFunction, Request, Response } from "express"
import { sendErrorResponse, sendSuccessResponse } from "../../helpers/responses"
import cookieParser from "cookie-parser"
import IError from "../../interfaces/error"
import withAuth from "../../middleware/withAuth"
import users from "./users"
import applications from "./applications"
import integrations from "./integrations"
import plans from "./plans"

export default (app: express.Application) => {
  const use =
    (fn: (req: Request, res: Response, next: NextFunction) => any) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next)

  const router = express.Router()
  router.use(express.json())
  router.use(cookieParser())

  app.use("/api", router)

  router.get("/", use(getIndex))
  // Authenticated routes below here
  router.use(use(withAuth))
  router.get("/hello", use(getIndex))

  integrations(router, use)
  users(router, use)
  applications(router, use)
  plans(router, use)

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
  sendSuccessResponse({ message: "hello world" }, req, res)
}
