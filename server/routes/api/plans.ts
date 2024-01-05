import { Request, Response, Router } from "express"
import PlanService from "../../services/planService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/plans", router)

  router.get("/", use(findMany))
  router.post("/", use(createPlan))
}

const findMany = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plans } = await planService.findMany(req.query)
  sendSuccessResponse({ plans }, req, res)
}

const createPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plan } = await planService.createPlan(req.body)
  sendSuccessResponse({ plan }, req, res)
}
