/*
 * Copyright SaaScape (c) 2024.
 */
import '../modules/getModuleAlias'
import { db } from '../db'
import './init/sockets'
import { initSocketClient } from './init/sockets'
import initializeWorkers from '../queue/workers/initWorkers'
import initializeCrons from './init/crons'
import initializeClients from '../clients/clients'
;(async () => {
  await db.init()
  await db.connect()
  await initSocketClient()
  await initializeWorkers()
  await initializeClients('background')
  initializeCrons()
  console.log('Background server running')
})()
