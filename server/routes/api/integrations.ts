import { Request, Response, Router } from "express"
import { sendSuccessResponse } from "../../helpers/responses"
import IntegrationService from "../../services/integrationService"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/integrations", router)

  router.get("/", use(getIntegrations))
}

const getIntegrations = async (req: Request, res: Response) => {
  const integrationService = new IntegrationService()
  const { integrations, enabledIntegrations } =
    await integrationService.getIntegrations()
  sendSuccessResponse({ integrations, enabledIntegrations }, req, res)
}
