/*
 * Copyright SaaScape (c) 2024.
 */

import http from 'http'
import https from 'https'
import { Server } from 'socket.io'
import jwtHelper from '../modules/jwt'
import constants from '../helpers/constants'
import initializeSocketEvents from './socketListeners'

interface ISocketConnection {
  userId?: string
}

class SocketServer {
  webServer: http.Server | https.Server | undefined
  io: Server | undefined
  connections: { [socketId: string]: ISocketConnection } = {}
  constructor() {
    this.webServer = undefined
    this.io = undefined
    this.connections = {}
  }

  startServer(webServer: http.Server | https.Server) {
    this.webServer = webServer
    const io: Server = new Server(webServer)

    this.io = io
    console.log('Socket server started')
    this.initRoutes()
  }

  private initRoutes() {
    if (!this.io) return
    const { io } = this
    io.use(async (socket, next) => {
      try {
        const { auth } = socket?.handshake
        if (auth?.type === 'background_server') {
          if (auth?.token !== process?.env?.BACKGROUND_SOCKET_TOKEN) {
            const err = new Error('Invalid background server token')
            return next(err)
          }
          socket.join(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)
          socket.data.isBackground = true
          return next()
        } else {
          const cookies = Object.fromEntries(
            (socket.handshake.headers.cookie || '').split('; ').map((str) => {
              const i = str.indexOf('=')
              const key = str.slice(0, i)
              const value = str.slice(i + 1)
              return [key, value]
            }) || [],
          )

          if (!cookies?.accessToken) {
            return next()
          }

          this.connections[socket.id] ??= {}
          const jwt = await jwtHelper.decipherJwt.access(cookies?.accessToken)
          this.connections[socket.id].userId = jwt?._id
          socket.data.userId = jwt?._id
          return next()
        }
      } catch (error: any) {
        console.log('Socket error', error)
        return next(error)
      }
    })

    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        delete this.connections[socket.id]
      })
      initializeSocketEvents(socket)
    })

    console.log('Socket routes initialized')
  }
}

export const io = new SocketServer()

export const initSockets = (webServer: http.Server | https.Server) => {
  io.startServer(webServer)
}
