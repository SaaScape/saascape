/*
 * Copyright SaaScape (c) 2024.
 */

import { IUser } from '../schemas/Users'
import { db } from '../db'
import { INotification, notificationType } from 'types/schemas/Notifications'
import { ObjectId } from 'mongodb'
import moment from 'moment'
import { io } from '../init/sockets'
import { NotificationEvents } from 'types/sockets'
import { sendEmail } from '../helpers/email'

export interface INotificator {
  title: string
  body: string
  type: notificationType
  from: 'system' | ObjectId
  to: ObjectId
  expireAt?: Date
  sendMail?: boolean
  link?: string
  isBackground?: boolean
}

export default class NotificationService {
  user?: IUser
  constructor(user?: IUser) {
    this.user = user
  }

  async findMany() {
    if (!this.user) throw new Error('User not found')
    const notifications = await db.managementDb
      ?.collection<INotification>('notifications')
      .find({
        to: this.user?._id,
      })
      .limit(100)
      .toArray()

    return notifications
  }

  async deleteNotification(notificationId: string) {
    if (!this.user) throw new Error('User not found')
    const deleteResult = await db.managementDb?.collection<INotification>('notifications').deleteOne({
      _id: new ObjectId(notificationId),
      to: new ObjectId(this.user?._id),
    })

    if (!deleteResult?.deletedCount) {
      throw new Error('Notification not found')
    }

    io?.io?.to(io.getUserRoom(this.user._id.toString())).emit(NotificationEvents.DELETED_NOTIFICATION, notificationId)
  }

  async markAsRead(notificationId: string) {
    if (!this.user) throw new Error('User not found')
    console.log(this.user?._id)
    console.log('notif id', notificationId)
    const updateResult = await db.managementDb?.collection<INotification>('notifications').updateOne(
      {
        _id: new ObjectId(notificationId),
        to: new ObjectId(this.user?._id),
      },
      {
        $set: {
          read: true,
        },
      },
    )

    if (!updateResult?.modifiedCount) {
      throw new Error('Notification not found')
    }

    io?.io?.to(io.getUserRoom(this.user._id.toString())).emit(NotificationEvents.READ_NOTIFICATION, notificationId)
  }

  private emitNotification(notification: INotification) {
    console.log('EMITTING NOTIFICATION-----------------', notification)
    const res = io.io
      ?.to(io.getUserRoom(notification.to.toString()))
      .emit(NotificationEvents.NEW_NOTIFICATION, notification)
    console.log(res)
  }

  async create(payload: INotificator, skipInsert?: boolean) {
    const {
      title,
      body,
      type,
      from,
      to,
      expireAt = moment().add(30, 'days').toDate(),
      link,
      sendMail,
      isBackground,
    } = payload
    const notification: INotification = {
      _id: new ObjectId(),
      title,
      body,
      type,
      from,
      to: new ObjectId(to),
      read: false,
      link,
      delete_on: expireAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (skipInsert) {
      return notification
    }

    await db.managementDb?.collection<INotification>('notifications').insertOne(notification)
    this.emitNotification(notification)
    if (sendMail && !isBackground) {
      try {
        const user = await db.managementDb?.collection<IUser>('users').findOne({ _id: new ObjectId(to) })

        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: title,
            html: body,
          })
        }
      } catch (err) {
        console.error('Error sending email', err)
      }
    }
  }

  async createMany(payload: INotificator[]) {
    const bulkInserts: any = []

    const userIds = payload.map((notif) => new ObjectId(notif.to))

    const users =
      (await db.managementDb
        ?.collection<IUser>('users')
        .find({
          _id: { $in: userIds },
        })
        .toArray()) || []

    const usersObj = Object.fromEntries(users.map((user) => [user._id.toString(), user]))

    const emailsToSend = []

    for (const notif of payload) {
      const payload = await this.create(notif, true)
      bulkInserts.push({
        insertOne: {
          document: payload,
        },
      })
      if (notif.sendMail && !notif.isBackground) {
        const user = usersObj?.[notif.to.toString()]
        if (user?.email) {
          emailsToSend.push(user?.email)
        }
      }
    }

    await db.managementDb?.collection<INotification>('notifications').bulkWrite(bulkInserts)

    for (const write of bulkInserts) {
      try {
        this.emitNotification(write.insertOne.document)
      } catch (err) {
        console.error('Error emitting notification', err)
      }
    }

    //   BULK SEND EMAILS
    if (emailsToSend.length) {
      const emailString = emailsToSend.join(', ')

      const { title, body } = payload[0]

      await sendEmail({
        bcc: emailString,
        subject: title,
        html: body,
      })
    }
  }
}
