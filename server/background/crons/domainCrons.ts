/*
 * Copyright SaaScape (c) 2024.
 */

import { CronJob } from 'cron'
import ServerService from '../../services/serverService'
import { db } from '../../db'
import { IServer } from '../../schemas/Servers'
import constants from '../../helpers/constants'
import { logError } from '../../helpers/error'
import { IDomain } from '../../schemas/Domains'
import { ObjectId } from 'mongodb'
import SSL from '../../modules/ssl'
import moment from 'moment'
import DomainService from '../../services/domainsService'
import ApplicationService from '../../services/applicationService'

const crons: { [key: string]: CronJob } = {}

const initializeDomainCrons = (use: Function) => {
  const renewDomainsCron = new CronJob('0 2 * * *', use(renewDomains))
  const bulkApplySSLCron = new CronJob('0 */1 * * *', use(bulkApplySSLCer))
  const getDNSDataCron = new CronJob('*/30 * * * * *', use(getDNSData))
  const syncApplicationDirectivesCron = new CronJob('0 */1 * * *', use(syncApplicationDirectives))

  //  Start crons
  bulkApplySSLCron.start()
  renewDomainsCron.start()
  getDNSDataCron.start()
  syncApplicationDirectivesCron.start()

  //  Store crons
  crons['bulkApplySSLCron'] = bulkApplySSLCron
  crons['renewDomainsCron'] = renewDomainsCron
  crons['getDNSDataCron'] = getDNSDataCron
  crons['syncApplicationDirectives'] = syncApplicationDirectivesCron
}

const renewDomains = async () => {
  console.log('renewing domains')
  crons?.['renewDomainsCron']?.stop()
  const domains = await db.managementDb
    ?.collection<IDomain>('domains')
    .find({
      'SSL.end_date': { $lte: moment().add(30, 'days').toDate() },
      'SSL.status': {
        $in: [constants.SSL_STATUSES.EXPIRED, constants.SSL_STATUSES.EXPIRING, constants.SSL_STATUSES.ACTIVE],
      },
    })
    .toArray()

  if (domains?.length) {
    console.log(`${domains.length} domains will be expiring soon`)
  } else {
    console.log('No domains will be expiring soon')
    crons?.['renewDomainsCron']?.start()
    return
  }

  const bulkUpdates = []

  for (const domain of domains) {
    const thisMoment = moment()
    const latestMoment = moment(thisMoment).add(30, 'days')

    const sslStatus =
      (moment(domain?.SSL?.end_date).isSameOrBefore(thisMoment) && constants.SSL_STATUSES.EXPIRED) ||
      (moment(domain?.SSL?.end_date).isSameOrBefore(latestMoment) && constants.SSL_STATUSES.EXPIRING)

    bulkUpdates.push({
      updateOne: {
        filter: {
          _id: new ObjectId(domain._id),
        },
        update: {
          $set: {
            'SSL.status': sslStatus,
          },
        },
      },
    })
  }

  if (bulkUpdates.length) {
    await db.managementDb?.collection<IDomain>('domains').bulkWrite(bulkUpdates)
  }

  for (const domain of domains || []) {
    try {
      const sslService = new SSL(domain?._id?.toString())
      await sslService.initializeSSL(true)
    } catch (err) {
      console.log(err)
      logError({
        error: JSON.stringify(err),
        entityId: new ObjectId(domain._id),
        module: constants.MODULES.DOMAIN,
        status: constants.STATUSES.FAILED_STATUS,
        event: constants.EVENTS.SSL_RENEWAL,
      })
    }
  }
  crons?.['renewDomainsCron']?.start()
}
const bulkApplySSLCer = async () => {
  console.log('bulk applying ssl cer')
  crons?.['bulkApplySSLCron']?.stop()

  const domains = await db.managementDb
    ?.collection<IDomain>('domains')
    .find({
      'SSL.status': {
        $in: [constants.SSL_STATUSES.EXPIRING, constants.SSL_STATUSES.ACTIVE],
      },
    })
    .toArray()

  if (!domains?.length) {
    crons?.['bulkApplySSLCron']?.start()
    return
  }

  for (const domain of domains) {
    try {
      const domainService = new DomainService()
      await domainService.applySSLCer(domain?._id)
    } catch (err) {
      console.warn(err)
    }
  }

  crons?.['bulkApplySSLCron']?.start()
}
const getDNSData = async () => {
  const domainService = new DomainService()
  crons?.['getDNSDataCron']?.stop()
  await domainService.cronCheckDnsData().catch((err) => console.log(err))
  crons?.['getDNSDataCron']?.start()
}
const syncApplicationDirectives = async () => {
  const applicationService = new ApplicationService()
  crons?.['syncApplicationDirectives']?.stop()
  await applicationService.syncApplicationDirectivesCron()
  crons?.['syncApplicationDirectives']?.start()
}

export default initializeDomainCrons
