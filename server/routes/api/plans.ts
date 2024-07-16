/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Request, Response, Router } from "express"
import PlanService from "../../services/planService"
import { sendSuccessResponse } from "../../helpers/responses"
import withPerms from "../../middleware/withPerms"
import permissions from "../../helpers/permissions"

export default (app: Router, use: any) => {
  const router = Router()
  app.use("/plans", router)

  router.get("/", use(withPerms([permissions.PLANS.VIEW_PLANS])), use(findMany))
  router.post(
    "/",
    use(withPerms([permissions.PLANS.CREATE_PLANS])),
    use(createPlan)
  )
  router.get(
    "/:id",
    use(withPerms([permissions.PLANS.VIEW_PLANS])),
    use(getPlan)
  )
  router.put(
    "/:id",
    use(withPerms([permissions.PLANS.UPDATE_PLANS])),
    use(updatePlan)
  )
  router.delete("/addon-plan/:id/", use(removeAddonPlan))
  router.delete(
    "/:id",
    use(withPerms([permissions.PLANS.DELETE_PLANS])),
    use(deletePlan)
  )
}

const findMany = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plans } = await planService.findMany(req.query)
  sendSuccessResponse({ plans }, req, res)
}

const getPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plan } = await planService.findPlan(req.params.id)
  sendSuccessResponse({ plan }, req, res)
}

const createPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { plan } = await planService.createPlan(req.body)
  sendSuccessResponse({ plan }, req, res)
}
const updatePlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { success } = await planService.updatePlan(req.params?.id, req.body)
  sendSuccessResponse({ success }, req, res)
}
const deletePlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { success } = await planService.deletePlan(req.params?.id)
  sendSuccessResponse({ success }, req, res)
}
const removeAddonPlan = async (req: Request, res: Response) => {
  const planService = new PlanService(req.query)
  const { success } = await planService.removeAddonPlan(
    req.params?.id,
    req.body
  )
  sendSuccessResponse({ success }, req, res)
}
