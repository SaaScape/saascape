import express, { Request, Response } from "express"
import UserService from "../../services/userService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: express.Router, use: Function) => {
  const router = express.Router()
  app.use("/users", router)

  router.get("/", use(getUsers))
}

const getUsers = async (req: Request, res: Response) => {
  const userService = new UserService()
  const { users } = await userService.getUsers(req.query)
  sendSuccessResponse({ users }, req, res)
}
