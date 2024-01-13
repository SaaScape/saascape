import { db } from "../db"
import "./init/sockets"
import { initSocketClient } from "./init/sockets"
;(async () => {
  await db.init()
  await db.connect()
  await initSocketClient()
  console.log("Background server running")
})()
