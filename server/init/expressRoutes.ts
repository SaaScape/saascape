import express from 'express'
import path from 'path'
import apiRouter from '../routes/api'
import authRouter from '../routes/auth'
import publicApiRouter from '../routes/publicApi'
import webhooksRouter from '../routes/webhooks'

export const initExpressRoutes = async (app: express.Application) => {
  // Init routes

  app.use(express.static(path.join(__dirname, '..', '..', 'client')))
  app.use(express.static(path.join(__dirname, '..', 'public')))

  apiRouter(app) // /api
  authRouter(app) // /auth
  publicApiRouter(app) // /public_api
  webhooksRouter(app) // /webhooks

  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'index.html'))
  })
}
