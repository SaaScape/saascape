import { Request, Response, Router } from "express"
import { ContactService } from "../../services/contactService"
import { sendSuccessResponse } from "../../helpers/responses"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/contacts", router)

  router.get(
    "/",
    use(withPerms([permissions.CONTACTS.VIEW_CONTACTS])),
    use(findMany)
  )
}

const findMany = async (req: Request, res: Response) => {
  const contactService = new ContactService()
  const { contacts } = await contactService.findMany(req.query)
  sendSuccessResponse({ contacts }, req, res)
}
