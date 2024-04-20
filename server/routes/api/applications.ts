import { Router } from "express"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"
import ApplicationService from "../../services/applicationService"
import { sendSuccessResponse } from "../../helpers/responses"
import { API } from "../../types/types"
import versions from "./versions"
import instances from "./instances"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/applications", router)
  versions(router, use)
  instances(router, use)

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
  router.put(
    "/:id/config",
    use(withPerms([permissions.APPLICATIONS.UPDATE_APPLICATIONS])),
    use(updateConfig)
  )
}

const findMany: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { applications } = await applicationService.findMany()
  sendSuccessResponse({ applications }, req, res)
}
const findOne: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.findOne(req.params.id)
  sendSuccessResponse({ application }, req, res)
}
const update: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.update(
    req.params.id,
    req.body
  )
  sendSuccessResponse({ application }, req, res)
}

const deleteOne: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.deleteOne(req.params.id)
  sendSuccessResponse({ application }, req, res)
}

const create: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { application } = await applicationService.create(req.body)
  sendSuccessResponse({ application }, req, res)
}

const updateConfig: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { application } =
    (await applicationService.updateConfig(req.params.id, req.body)) || {}
  sendSuccessResponse({ application }, req, res)
}
