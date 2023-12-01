import express from "express"
import apiRouter from "../routes/api"

export const initExpressRoutes = async (app: express.Application) => {
  // Init routes

  // init /api
  apiRouter(app)
}
