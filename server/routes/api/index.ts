import express, { NextFunction, Request, Response } from "express"

export default (app: express.Application) => {
  const use =
    (fn: (req: Request, res: Response, next: NextFunction) => any) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next)

  const router = express.Router()
  app.use("/api", router)

  router.get("/", use(getIndex))

  //  ROUTE IMPORTS -----------------------

  // END ROUTE IMPORTS ---------------------

  router.use(catchError)
}

const catchError = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err)
  res.status(500).send("Internal Server Error")
}

const getIndex = async (req: Request, res: Response) => {
  res.send("Hello World!")
}
