import { db } from "../db"
import "./init/sockets"
import { initSocketClient } from "./init/sockets"
import initializeWorkers from "../queue/workers/initWorkers"
;(async () => {
  await db.init()
  await db.connect()
  await initSocketClient()
  await initializeWorkers()
  console.log("Background server running")
})()
