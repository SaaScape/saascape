/*
 * Copyright SaaScape (c) 2024.
 */

import { InstanceSocketEvents, NotificationEvents } from 'types/sockets'
import { Socket } from 'socket.io'
import { misc } from 'types/enums'
import NotificationService, { INotificator } from '../services/notificationService'

type SocketEvent = (data: any) => void

type SocketListener = () => {
  [misc.BACKGROUND]: (data: any) => void
  [misc.CLIENT]: (data: any) => void
}

let socketServer: Socket

// Instance Events
const onInstanceDeployed: SocketListener = () => ({
  [misc.BACKGROUND]: (data: any) => {
    console.log('Instance deployed', data)
    const { instance_id } = data
    socketServer?.emit(InstanceSocketEvents.INSTANCE_DEPLOYED, { instance_id })
  },
  [misc.CLIENT]: (data: any) => {},
})
const onInstanceDeploymentFailed: SocketListener = () => ({
  [misc.BACKGROUND]: (data: any) => {
    console.log('Instance deployment failed', data)
    const { instance_id, error } = data
    socketServer?.emit(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED, { instance_id, error })
  },
  [misc.CLIENT]: (data: any) => {},
})
const onInstanceHealthUpdate: SocketListener = () => ({
  [misc.BACKGROUND]: (data: any) => {
    socketServer?.emit(InstanceSocketEvents.UPDATE_HEALTH, data)
  },
  [misc.CLIENT]: (data: any) => {},
})

const onNewNotification: SocketListener = () => ({
  [misc.BACKGROUND]: async (data: INotificator) => {
    const notificationService = new NotificationService()
    await notificationService.create(data)
  },
  [misc.CLIENT]: (data: any) => {},
})

const onNewNotifications: SocketListener = () => ({
  [misc.BACKGROUND]: async (data: INotificator[]) => {
    const notificationService = new NotificationService()
    await notificationService.createMany(data)
  },
  [misc.CLIENT]: (data: any) => {},
})

const getSocketEvent: (socket: Socket, listener: SocketListener) => SocketEvent = (socket, listener) => {
  const isBackground = socket.data.isBackground
  return listener?.()?.[isBackground ? misc.BACKGROUND : misc.CLIENT]
}

const initializeSocketEvents = (socket: Socket) => {
  socketServer = socket
  //   Instance
  socket.on(InstanceSocketEvents.INSTANCE_DEPLOYED, getSocketEvent(socket, onInstanceDeployed))
  socket.on(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED, getSocketEvent(socket, onInstanceDeploymentFailed))
  socket.on(InstanceSocketEvents.UPDATE_HEALTH, getSocketEvent(socket, onInstanceHealthUpdate))

  //   Notifications
  socket.on(NotificationEvents.NEW_NOTIFICATION, getSocketEvent(socket, onNewNotification))
  socket.on(NotificationEvents.NEW_NOTIFICATIONS, getSocketEvent(socket, onNewNotifications))
}

export default initializeSocketEvents
