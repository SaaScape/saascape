import { Router } from "express"
import { routeFunction } from "."
import DomainService from "../../services/domainsService"
import { sendSuccessResponse } from "../../helpers/responses"
import { io } from "../../init/sockets"
import constants from "../../helpers/constants"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/domains", router)

  router.get("/", use(findMany))
  router.get("/:id", use(findOne))
  router.post("/", use(addDomain))
  router.put("/:id", use(updateDomain))
}

const findOne: routeFunction = async (req, res) => {
  const domainService = new DomainService()
  const { domain } = await domainService.findOne(req.params.id)
  sendSuccessResponse({ domain }, req, res)
}
const findMany: routeFunction = async (req, res) => {
  const domainService = new DomainService()
  const { data } = await domainService.findMany(req.query)
  sendSuccessResponse({ data }, req, res)
}

const addDomain: routeFunction = async (req, res) => {
  const domainService = new DomainService()
  const { domain } = await domainService.addDomain(req.body)
  io.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.DOMAIN_ADD, { _id: domain?.insertedId })
  sendSuccessResponse({ domain }, req, res)
}

const updateDomain: routeFunction = async (req, res) => {
  const domainService = new DomainService()
  const { domain } = await domainService.updateDomain(req.params.id, req.body)
  sendSuccessResponse({ domain }, req, res)
}
