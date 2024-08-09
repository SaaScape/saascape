/*
 * Copyright SaaScape (c) 2024.
 */

import { DeploymentEvents, InstanceSocketEvents, NotificationEvents } from 'types/sockets'
import { Socket } from 'socket.io'
import { misc } from 'types/enums'
import NotificationService, { INotificator } from '../services/notificationService'
import { DeploymentInstanceUpdateSocketData, DeploymentUpdateSocketData } from 'types/schemas/Deployments'
import constants from '../helpers/constants'
import { io } from './sockets'

type SocketEvent = (data: any) => void

type SocketListener = (socket: Socket) => {
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

const onDeploymentInstanceUpdate: SocketListener = () => ({
  [misc.BACKGROUND]: async (data: DeploymentInstanceUpdateSocketData) => {
    io.io
      ?.to(`${constants.SOCKET_ROOMS.DEPLOYMENT}${data?.deploymentId}`)
      ?.emit(DeploymentEvents.DEPLOYMENT_INSTANCE_UPDATED, data)
  },
  [misc.CLIENT]: (data: any) => {},
})
const onDeploymentUpdate: SocketListener = () => ({
  [misc.BACKGROUND]: async (data: DeploymentUpdateSocketData) => {
    io.io
      ?.to(`${constants.SOCKET_ROOMS.DEPLOYMENT}${data?.deploymentId}`)
      ?.emit(DeploymentEvents.DEPLOYMENT_UPDATED, data)
  },
  [misc.CLIENT]: (data: any) => {},
})

const onJoinDeploymentRoom: SocketListener = (socket) => ({
  [misc.BACKGROUND]: async (data: { deploymentId: string }) => {},
  [misc.CLIENT]: (data: { deploymentId: string }) => {
    const room = `${constants.SOCKET_ROOMS.DEPLOYMENT}${data?.deploymentId}`
    socket.join(room)
    console.log('Joined room', room, socket.id)
  },
})
const onLeaveDeploymentRoom: SocketListener = (socket) => ({
  [misc.BACKGROUND]: async (data: { deploymentId: string }) => {},
  [misc.CLIENT]: (data: { deploymentId: string }) => {
    const room = `${constants.SOCKET_ROOMS.DEPLOYMENT}${data?.deploymentId}`
    socket.leave(room)
    console.log('Left room', room, socket.id)
  },
})

const getSocketEvent: (socket: Socket, listener: SocketListener) => SocketEvent = (socket, listener) => {
  const isBackground = socket.data.isBackground
  return listener?.(socket)?.[isBackground ? misc.BACKGROUND : misc.CLIENT]
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

  //   Deployments
  socket.on(DeploymentEvents.DEPLOYMENT_INSTANCE_UPDATED, getSocketEvent(socket, onDeploymentInstanceUpdate))
  socket.on(DeploymentEvents.DEPLOYMENT_UPDATED, getSocketEvent(socket, onDeploymentUpdate))
  socket.on(DeploymentEvents.JOIN_DEPLOYMENT_ROOM, getSocketEvent(socket, onJoinDeploymentRoom))
  socket.on(DeploymentEvents.LEAVE_DEPLOYMENT_ROOM, getSocketEvent(socket, onLeaveDeploymentRoom))
}

export default initializeSocketEvents
