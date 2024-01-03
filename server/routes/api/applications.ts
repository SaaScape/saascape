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
  router.get(
    "/:id",
    use(withPerms([permissions.APPLICATIONS.VIEW_APPLICATIONS])),
    use(findOne)
  )
  router.put(
    "/:id",
    use(withPerms([permissions.APPLICATIONS.UPDATE_APPLICATIONS])),
    use(update)
  )
  router.delete(
    "/:id",
    use(withPerms([permissions.APPLICATIONS.DELETE_APPLICATIONS])),
    use(deleteOne)
  )
  router.post(
    "/",
    use(withPerms([permissions.APPLICATIONS.CREATE_APPLICATIONS])),
    use(create)
  )
}

const findMany = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { applications } = await applicationService.findMany()
  sendSuccessResponse({ applications }, req, res)
}
const findOne = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.findOne(req.params.id)
  sendSuccessResponse({ application }, req, res)
}
const update = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.update(
    req.params.id,
    req.body
  )
  sendSuccessResponse({ application }, req, res)
}

const deleteOne = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.deleteOne(req.params.id)
  sendSuccessResponse({ application }, req, res)
}

const create = async (req: Request, res: Response) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.create(req.body)
  sendSuccessResponse({ application }, req, res)
}
