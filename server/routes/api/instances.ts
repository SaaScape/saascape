/*
 * Copyright SaaScape (c) 2024.
 */

import { Router } from 'express'
import { API } from '../../types/types'
import { sendSuccessResponse } from '../../helpers/responses'
import { ObjectId } from 'mongodb'
import InstanceService from '../../services/instanceService'
import withPerms from '../../middleware/withPerms'
import permissions from '../../helpers/permissions'
import { io } from '../../init/sockets'
import constants from '../../helpers/constants'
import { DomainSocketEvents, InstanceSocketEvents } from 'types/sockets'
import ApplicationService from '../../services/applicationService'

export default (app: Router, use: any) => {
  const router = Router({ mergeParams: true })
  const instanceRouter = Router({ mergeParams: true })
  app.use('/instances', instanceRouter)
  app.use('/:application_id/instances', router)

  instanceRouter.get('/instancesHealth', use(getInstancesHealth))

  router.get('/', use(findMany))
  router.get('/instancesInfo', use(getInstancesStats))
  router.get('/:id', use(findOne))
  router.post('/', use(insertOne))
  router.put('/:id', use(updateOne))
  router.delete('/:id', use(deleteOne))
  router.put('/:id/config', use(withPerms([permissions.APPLICATIONS.UPDATE_APPLICATIONS])), use(updateConfig))
  router.put('/:id/deploy', use(withPerms([permissions.APPLICATIONS.UPDATE_APPLICATIONS])), use(deployInstance))
  router.put('/:id/scale', use(withPerms([permissions.APPLICATIONS.UPDATE_APPLICATIONS])), use(scaleInstance))
}

const findMany: API = async (req, res) => {
  const { application_id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const { instances } = await instanceService.findMany()
  sendSuccessResponse({ instances }, req, res)
}

const findOne: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const { instance } = await instanceService.findOne(new ObjectId(id))
  sendSuccessResponse({ instance }, req, res)
}

const getInstancesStats: API = async (req, res) => {
  const { application_id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const { instancesData } = await instanceService.getInstancesStats()
  sendSuccessResponse({ instancesData }, req, res)
}

const insertOne: API = async (req, res) => {
  const { application_id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const { instance } = await instanceService.create(req.body)
  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.CREATE_INSTANCE_CLIENT, { instance_id: instance?._id })
  sendSuccessResponse({ instance }, req, res)
}

const deleteOne: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  await instanceService.deleteOne(new ObjectId(id))

  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.INSTANCE_DELETE, { instance_id: id })
  sendSuccessResponse({}, req, res)
}
const updateConfig: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const instance = (await instanceService.updateConfig(id, req.body)) || {}
  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.UPDATE_INSTANCE_CLIENT_DATA, { instance_id: id })
  sendSuccessResponse({ instance }, req, res)
}
const updateOne: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const instance = (await instanceService.updateOne(id, req.body)) || {}
  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(DomainSocketEvents.SYNC_APPLICATION_DIRECTIVES, { applicationId: application_id })
  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.UPDATE_INSTANCE_CLIENT_DATA, { instance_id: id })
  sendSuccessResponse({ instance }, req, res)
}

const deployInstance: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const instance = (await instanceService.requestDeployment(id)) || {}
  io?.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.DEPLOY_INSTANCE, { instance_id: id })
  sendSuccessResponse({ instance }, req, res)
}

const scaleInstance: API = async (req, res) => {
  const { application_id, id } = req.params
  const instanceService = new InstanceService(new ObjectId(application_id))
  const instance = (await instanceService.scaleInstance(id, req.body)) || {}
  io?.io?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS).emit(InstanceSocketEvents.DEPLOY_INSTANCE, { instance_id: id })
  sendSuccessResponse({ instance }, req, res)
}

const getInstancesHealth: API = async (req, res) => {
  const applicationService = new ApplicationService()
  const { instanceHealths } = await applicationService.getInstancesHealth()
  sendSuccessResponse({ instanceHealths }, req, res)
}
