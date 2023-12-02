import express from "express"
import apiRouter from "../routes/api"
import authRouter from "../routes/auth"
import publicApiRouter from "../routes/publicApi"
import webhooksRouter from "../routes/webhooks"

export const initExpressRoutes = async (app: express.Application) => {
  // Init routes

  apiRouter(app) // /api
  authRouter(app) // /auth
  publicApiRouter(app) // /public_api
  webhooksRouter(app) // /webhooks
}
