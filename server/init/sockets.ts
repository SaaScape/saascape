import http from "http"
import https from "https"
import { Server } from "socket.io"

class SocketServer {
  webServer: http.Server | https.Server | undefined
  io: Server | undefined
  constructor() {
    this.webServer = undefined
    this.io = undefined
  }

  startServer(webServer: http.Server | https.Server) {
    this.webServer = webServer
    const io = new Server(webServer)
    this.io = io
    console.log("Socket server started")
    this.initRoutes()
  }

  private initRoutes() {
    if (!this.io) return
    const { io } = this
    io.on("connection", (socket) => {
      console.log("a socket has connected")
    })
    console.log("Socket routes initialized")
  }
}

export const io = new SocketServer()

export const initSockets = (webServer: http.Server | https.Server) => {
  const socketServer = new SocketServer()
  socketServer.startServer(webServer)
}
