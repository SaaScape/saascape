import { Request, Response, Router } from "express"
import PlanService from "../../services/planService"
import { sendSuccessResponse } from "../../helpers/responses"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/plans", router)

  router.get("/", use(withPerms([permissions.PLANS.VIEW_PLANS])), use(findMany))
  router.post(
    "/",
    use(withPerms([permissions.PLANS.CREATE_PLANS])),
    use(createPlan)
  )
  router.get(
    "/:id",
    use(withPerms([permissions.PLANS.VIEW_PLANS])),
    use(getPlan)
  )
}

const findMany = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plans } = await planService.findMany(req.query)
  sendSuccessResponse({ plans }, req, res)
}

const getPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plan } = await planService.findPlan(req.params.id)
  sendSuccessResponse({ plan }, req, res)
}

const createPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plan } = await planService.createPlan(req.body)
  sendSuccessResponse({ plan }, req, res)
}
