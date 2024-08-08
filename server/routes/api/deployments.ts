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
  router.post('/', use(createDeployment))
  router.get('/:deploymentId', use(findDeployment))
}

const findMany: API = async (req, res) => {
  const { application_id } = req.params
  const deploymentService = new DeploymentService(application_id, req)
  const { data } = await deploymentService.findMany(req.query)
  return sendSuccessResponse({ data }, req, res)
}

const createDeployment: API = async (req, res) => {
  const { application_id, id } = req.params
  const deploymentService = new DeploymentService(application_id, req)
  const { deployment } = await deploymentService.createDeployment(req.body)
  return sendSuccessResponse({ deployment }, req, res)
}

const findDeployment: API = async (req, res) => {
  const { application_id, id } = req.params
  const deploymentService = new DeploymentService(application_id, req)
  const { deployment, targetInstances } = await deploymentService.findDeployment(req.params.deploymentId)
  sendSuccessResponse({ deployment, targetInstances }, req, res)
}
