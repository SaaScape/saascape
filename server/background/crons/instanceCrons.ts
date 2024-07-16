/*
 * Copyright SaaScape (c) 2024.
 */

import { CronJob } from 'cron'
import { clients, initializeInstanceClients } from '../../clients/clients'

const crons: { [key: string]: CronJob } = {}

const initializeInstanceCrons = (use: Function) => {
  const updateInstanceDetailsCron = new CronJob('*/10 * * * * *', use(updateInstanceDetails))
  const fetchNewClientsCron = new CronJob('*/30 * * * * *', use(fetchNewClients))
  const sendInstanceHealthNotificationsCron = new CronJob('*/30 * * * * *', use(sendInstanceHealthNotifications))

  updateInstanceDetailsCron.start()
  fetchNewClientsCron.start()
  sendInstanceHealthNotificationsCron.start()

  crons['updateInstanceDetailsCron'] = updateInstanceDetailsCron
  crons['fetchNewClientsCron'] = fetchNewClientsCron
  crons['sendInstanceHealthNotificationsCron'] = sendInstanceHealthNotificationsCron
}

const updateInstanceDetails = async () => {
  crons['updateInstanceDetailsCron'].stop()
  console.log('Updating instance data')
  for (const instanceClient of Object.values(clients.instance)) {
    try {
      await instanceClient.updateInstanceDetails()
    } catch (err) {}
  }
  crons['updateInstanceDetailsCron'].start()
}

const fetchNewClients = async () => {
  console.log('Fetching new clients')
  await initializeInstanceClients()
}

const sendInstanceHealthNotifications = async () => {
  console.log('Sending instance health notifications')
  for (const instanceClient of Object.values(clients.instance)) {
    try {
      await instanceClient.sendInstanceHealthNotifications()
    } catch (err) {}
  }
}

export default initializeInstanceCrons
