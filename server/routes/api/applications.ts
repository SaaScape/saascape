import { Request, Response, Router } from "express"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"
import ApplicationService from "../../services/applicationService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/applications", router)

  router.get(
    "/",
    use(withPerms([permissions.APPLICATIONS.VIEW_APPLICATIONS])),
    use(findMany)
  )
}

const findMany = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { applications } = await applicationService.findMany()
  sendSuccessResponse({ applications }, req, res)
}
