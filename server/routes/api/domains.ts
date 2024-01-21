import { Router } from "express"
import { routeFunction } from "."
import DomainService from "../../services/domainsService"
import { sendSuccessResponse } from "../../helpers/responses"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/domains", router)

  router.get("/", use(findMany))
}

const findMany: routeFunction = async (req, res) => {
  const domainService = new DomainService()
  const { data } = await domainService.findMany(req.query)
  sendSuccessResponse({ data }, req, res)
}
