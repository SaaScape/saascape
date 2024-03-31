import { Application, Request, Response, Router } from "express"
import VersionService from "../../services/versionService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: Router, use: Function) => {
  const router = Router()
  app.use("/versions", router)

  router.get("/", use(findMany))
  router.post("/", use(insertOne))
}

const findMany = async (req: Request, res: Response) => {}
const insertOne = async (req: Request, res: Response) => {
  const versionService = new VersionService()
  const { version } = await versionService.createVersion(req.body)
  sendSuccessResponse(version, req, res)
}
