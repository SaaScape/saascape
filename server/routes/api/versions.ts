import { Application, Request, Response, Router } from "express"
import VersionService from "../../services/versionService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: Router, use: Function) => {
  const router = Router({ mergeParams: true })
  app.use("/:application_id/versions", router)

  router.get("/", use(findMany))
  router.post("/", use(insertOne))
}

const findMany = async (req: Request, res: Response) => {
  const versionService = new VersionService(req.params.application_id)
  const { data } = await versionService.getVersions(req.query)
  sendSuccessResponse({ data }, req, res)
}
const insertOne = async (req: Request, res: Response) => {
  const versionService = new VersionService(req.params.application_id)
  const { version } = await versionService.createVersion(req.body)
  sendSuccessResponse(version, req, res)
}
