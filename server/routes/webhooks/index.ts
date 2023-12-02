import express, { NextFunction, Request, Response } from "express"
import { sendErrorResponse, sendSuccessResponse } from "../../helpers/responses"
import cookieParser from "cookie-parser"
import IError from "../../interfaces/error"

export default (app: express.Application) => {
  const use =
    (fn: (req: Request, res: Response, next: NextFunction) => any) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next)

  const router = express.Router()
  router.use(express.json())
  router.use(cookieParser())

  app.use("/webhooks", router)

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
  sendSuccessResponse({ message: "hello webhook world" }, req, res)
}
