import { Router } from "express"
import { API } from "../../types/types"
import { sendSuccessResponse } from "../../helpers/responses"
import { ObjectId } from "mongodb"
import InstanceService from "../../services/instanceService"

export default (app: Router, use: any) => {
  const router = Router({ mergeParams: true })
  app.use("/:application_id/instances", router)

  router.get("/", use(findMany))
  router.get("/instancesInfo", use(getInstancesStats))
  router.get("/:id", use(findOne))
  router.post("/", use(insertOne))
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
  sendSuccessResponse({ instance }, req, res)
}