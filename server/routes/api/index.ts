import express, { NextFunction, Request, Response } from 'express'
import { sendErrorResponse, sendSuccessResponse } from '../../helpers/responses'
import cookieParser from 'cookie-parser'
import IError from '../../interfaces/error'
import withAuth from '../../middleware/withAuth'
import users from './users'
import applications from './applications'
import integrations from './integrations'
import plans from './plans'
import contacts from './contacts'
import servers from './servers'
import domains from './domains'
import notifications from './notifications'

export type routeFunction = (req: Request, res: Response, next?: NextFunction) => any

export default (app: express.Application) => {
  const use =
    (fn: (req: Request, res: Response, next: NextFunction) => any) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next)

  const router = express.Router()
  router.use(express.json())
  router.use(cookieParser())

  app.use('/api', router)

  // Authenticated routes below here
  router.use(use(withAuth))

  integrations(router, use)
  users(router, use)
  applications(router, use)
  plans(router, use)
  contacts(router, use)
  servers(router, use)
  domains(router, use)
  notifications(router, use)

  router.use(catchError)
}

const catchError = async (err: IError, req: Request, res: Response, next: NextFunction) => {
  sendErrorResponse(err, req, res)
}
