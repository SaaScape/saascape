import http from "http"
import https from "https"
import { Server } from "socket.io"

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
    const io = new Server(webServer)
    this.io = io
    console.log("Socket server started")
    this.initRoutes()
  }

  private initRoutes() {
    if (!this.io) return
    const { io } = this
    io.on("connection", (socket) => {
      console.log("a socket has connected", socket.id)
      this.connections[socket.id] = {}
      socket.on("disconnect", () => {
        delete this.connections[socket.id]
        console.log("a socket has disconnected", socket.id)
        console.log(this.connections)
      })
      socket.on("authenticated", (data) => {
        console.log(data)
        this.connections[socket.id] ??= {}
        this.connections[socket.id].userId = data._id
        console.log(this.connections)
      })
    })
    console.log("Socket routes initialized")
  }
}

export const io = new SocketServer()

export const initSockets = (webServer: http.Server | https.Server) => {
  io.startServer(webServer)
}
