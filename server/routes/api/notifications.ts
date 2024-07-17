/*
 * Copyright SaaScape (c) 2024.
 */

import { Router } from 'express'
import { API } from '../../types/types'
import NotificationService from '../../services/notificationService'
import { sendSuccessResponse } from '../../helpers/responses'

export default (app: Router, use: any) => {
  const router = Router()
  app.use('/notifications', router)

  router.get('/', use(findMany))
  router.patch('/:notificationId', use(markAsRead))
  router.delete('/:notificationId', use(deleteNotification))

  router.post('/', use(create))
}

const findMany: API = async (req, res) => {
  const notificationService = new NotificationService(req.userObj)
  const notifications = await notificationService.findMany()
  sendSuccessResponse(notifications, req, res)
}

const markAsRead: API = async (req, res) => {
  const notificationService = new NotificationService(req.userObj)
  await notificationService.markAsRead(req.params.notificationId)
  sendSuccessResponse({}, req, res)
}

const deleteNotification: API = async (req, res) => {
  const notificationService = new NotificationService(req.userObj)
  await notificationService.deleteNotification(req.params.notificationId)
  sendSuccessResponse({}, req, res)
}

const create: API = async (req, res) => {
  const notificationService = new NotificationService(req.userObj)
  await notificationService.create({
    title: req.body.title,
    body: req.body.body,
    type: req.body.type,
    from: req.body.from,
    to: req.body.to,
    link: req.body.link,
    expireAt: req.body.expireAt,
    sendMail: req.body.sendMail,
  })
  sendSuccessResponse({}, req, res)
}
