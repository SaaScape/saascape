/*
 * Copyright SaaScape (c) 2024.
 */

import { Router } from 'express'
import { API } from '../../types/types'
import DeploymentService from '../../services/deploymentService'
import { sendSuccessResponse } from '../../helpers/responses'

export default (app: Router, use: any) => {
  const router = Router({ mergeParams: true })
  app.use('/:application_id/deployments', router)

  router.get('/', use(findMany))
}

const findMany: API = async (req, res) => {
  const { application_id } = req.params
  const deploymentService = new DeploymentService(application_id)
  const { data } = await deploymentService.findMany(req.query)
  return sendSuccessResponse({ data }, req, res)
}
