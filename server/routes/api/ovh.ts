/*
 * Copyright SaaScape (c) 2024.
 */

import { Router } from 'express'
import { API } from '../../types/types'
import OVHService from '../../services/ovhService'
import { sendSuccessResponse } from '../../helpers/responses'

export default (app: Router, use: any) => {
  const router = Router()
  app.use('/ovh', router)

  router.get('/', use(getIntegration))
}

const getIntegration: API = async (req, res) => {
  const ovhService = new OVHService()
  const ovhIntegration = await ovhService.getIntegration()
  return sendSuccessResponse({ ovhIntegration }, req, res)
}
