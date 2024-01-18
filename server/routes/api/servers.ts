import { Request, Response, Router } from "express"
import ServerService from "../../services/serverService"
import { sendSuccessResponse } from "../../helpers/responses"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"
import { io } from "../../init/sockets"
import constants from "../../helpers/constants"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/servers", router)

  router.get(
    "/",
    use(withPerms([permissions.SERVERS.VIEW_SERVERS])),
    use(findMany)
  )
  router.post(
    "/",
    use(withPerms([permissions.SERVERS.CREATE_SERVERS])),
    use(createServer)
  )
  router.post(
    "/test-connection",
    use(withPerms([permissions.SERVERS.CREATE_SERVERS])),
    use(testConnection)
  )
}

const testConnection = async (req: Request, res: Response) => {
  const serverService = new ServerService()
  const { success, data } = await serverService.testConnection(req.body)
  sendSuccessResponse({ success, data }, req, res)
}

const createServer = async (req: Request, res: Response) => {
  const serverService = new ServerService()
  const { _id } = await serverService.create(req.body)
  io.io
    ?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
    .emit(constants.SOCKET_EVENTS.SERVER_INITIALIZE, { _id })
  sendSuccessResponse({}, req, res)
}

const findMany = async (req: Request, res: Response) => {
  const serverService = new ServerService()
  const { servers } = await serverService.findMany(req.query)
  sendSuccessResponse({ servers }, req, res)
}
