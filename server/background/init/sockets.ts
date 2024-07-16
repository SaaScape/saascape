/*
 * Copyright SaaScape (c) 2024.
 */

import { Socket, io } from 'socket.io-client'
import constants from '../../helpers/constants'
import ServerSocket from '../socketServices/serverSocket'
import DomainSocket from '../socketServices/domainSocket'
import InstanceSocket from '../socketServices/instanceSocket'
export let socket: Socket | undefined

const generateSocketEventMap = () => {
  const socketServices = [ServerSocket, DomainSocket, InstanceSocket]
  const obj: { [key: string]: string } = {}
  for (const Service of socketServices) {
    const service = new Service()
    for (const event of Object.keys(service.events)) {
      obj[event] = service.name
    }
  }

  return obj
}
const socketEventMap = generateSocketEventMap()

class SocketEvent {
  data: any
  event: string
  constructor(data: any, event: string) {
    this.data = data
    this.event = event
    this.handleEvent()
  }

  handleEventError(err: any) {
    console.error(`An error occurred when executing, ${this?.event} : ${JSON.stringify(err)}`)
  }

  async handleEvent() {
    try {
      const Service = this.routeMap?.[socketEventMap?.[this.event]]
      if (!Service) return
      const service = new Service(this.data, this.event)
      await Promise.resolve(service.events?.[this.event]?.()).catch(this.handleEventError)
    } catch (err) {
      console.warn(err)
    }
  }

  routeMap = {
    // MAP ROUTES TO SERVICE
    [constants.SOCKET_ROUTES.SERVER]: ServerSocket,
    [constants.SOCKET_ROUTES.DOMAIN]: DomainSocket,
    [constants.SOCKET_ROUTES.INSTANCE]: InstanceSocket,
  }
}

const listener = (...args: any) => {
  new SocketEvent(args?.[1], args?.[0])
}

const socketRoutes = (socket: Socket) => {
  socket.onAny(listener)
}

export const initSocketClient = async () => {
  return new Promise((resolve, reject) => {
    const socketIo = io(process?.env?.BACKEND_URL || '', {
      auth: {
        type: 'background_server',
        token: process.env?.BACKGROUND_SOCKET_TOKEN,
      },
    })
    socketIo.on('connect', () => {
      console.log('Background server connected to main server on', socketIo?.id)
      socket = socketIo
      socketRoutes(socket)
      resolve(socket)
    })
  })
}
