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
  router.get(
    "/:id",
    use(withPerms([permissions.CONTACTS.VIEW_CONTACTS])),
    use(findById)
  )
  router.post(
    "/",
    use(withPerms([permissions.CONTACTS.CREATE_CONTACTS])),
    use(create)
  )
  router.put(
    "/:id",
    use(withPerms([permissions.CONTACTS.UPDATE_CONTACTS])),
    use(update)
  )
}

const findMany = async (req: Request, res: Response) => {
  const contactService = new ContactService()
  const { contacts } = await contactService.findMany(req.query)
  sendSuccessResponse({ contacts }, req, res)
}

const findById = async (req: Request, res: Response) => {
  const contactService = new ContactService()
  const { contact } = await contactService.findById(req.params.id)
  sendSuccessResponse({ contact }, req, res)
}

const create = async (req: Request, res: Response) => {
  const contactService = new ContactService()
  const { contact } = await contactService.create(req.body)
  sendSuccessResponse({ contact }, req, res)
}

const update = async (req: Request, res: Response) => {
  const contactService = new ContactService()
  const { contact } = await contactService.update(req.params.id, req.body)
  sendSuccessResponse({ contact }, req, res)
}
