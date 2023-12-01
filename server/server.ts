import express from "express"
import http from "http"
import https from "https"
import fsp from "fs/promises"
import { initSockets } from "./init/sockets"
import { initExpressRoutes } from "./init/expressRoutes"
;(async () => {
  const { SSL_KEY, SSL_CERT, HOST_PORT } = process.env
  const isSSL = SSL_KEY && SSL_CERT

  const sslFiles = {
    key: isSSL && (await fsp.readFile(SSL_KEY)),
    cert: isSSL && (await fsp.readFile(SSL_CERT)),
  }

  const app = express()
  const webServer = isSSL
    ? https.createServer(sslFiles, app)
    : http.createServer(app)

  initSockets(webServer)
  initExpressRoutes(app)

  webServer.listen(HOST_PORT, () => {
    console.log(`Listening on port ${HOST_PORT}`)
  })
})()
