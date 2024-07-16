/*
 * Copyright SaaScape (c) 2024.
 */

import { CronJob } from 'cron'
import ServerService from '../../services/serverService'
import { db } from '../../db'
import { IServer } from '../../schemas/Servers'
import constants from '../../helpers/constants'
import { logError } from '../../helpers/error'

const crons: { [key: string]: CronJob } = {}

const initializeServerCrons = (use: Function) => {
  const serverAvailabilityCron = new CronJob('*/30 * * * * *', use(getServerAvailability))
  serverAvailabilityCron.start()

  const syncDomainsCron = new CronJob('*/30 * * * * *', use(syncDomains))
  syncDomainsCron.start()

  crons['serverAvailabilityCron'] = serverAvailabilityCron
  crons['syncDomainsCron'] = syncDomainsCron
}

const getServerAvailability = async () => {
  const serverService = new ServerService()
  await serverService.getServerAvailability()
}
const syncDomains = async () => {
  console.log('syncing domains')
  crons?.['syncDomainsCron'].stop()
  const serverService = new ServerService()
  const servers = await db.managementDb
    ?.collection<IServer>('servers')
    .find({
      status: { $nin: [constants.STATUSES.DELETED_STATUS] },
    })
    .toArray()
  if (!servers) return

  for (const server of servers) {
    try {
      await serverService.syncDomains(server?._id, true)
    } catch (err) {
      console.warn(err)
    }
  }
  crons?.['syncDomainsCron'].start()
}

export default initializeServerCrons
