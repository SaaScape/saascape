import { CronJob } from "cron"
import ServerService from "../../services/serverService"
import { db } from "../../db"
import { IServer } from "../../schemas/Servers"
import constants from "../../helpers/constants"
import { logError } from "../../helpers/error"
import { IDomain } from "../../schemas/Domains"
import { ObjectId } from "mongodb"
import SSL from "../../modules/ssl"
import moment from "moment"

const crons: { [key: string]: CronJob } = {}

const initializeDomainCrons = (use: Function) => {
  const renewDomainsCron = new CronJob("* 2 * * *", use(renewDomains))
  const bulkApplySSLCron = new CronJob("*/30 * * * * *", use(bulkApplySSLCer))

  //  Start crons
  bulkApplySSLCron.start()
  renewDomainsCron.start()

  //  Store crons
  crons["bulkApplySSLCron"] = bulkApplySSLCron
  crons["renewDomainsCron"] = renewDomainsCron
}

const renewDomains = async () => {
  console.log("renewing domains")
  crons?.["renewDomainsCron"]?.stop()
  const domains = await db.managementDb
    ?.collection<IDomain>("domains")
    .find({
      "SSL.end_date": { $lte: moment().add(30, "days").toDate() },
      "SSL.status": {
        $in: [
          constants.SSL_STATUSES.EXPIRED,
          constants.SSL_STATUSES.EXPIRING,
          constants.SSL_STATUSES.ACTIVE,
        ],
      },
    })
    .toArray()

  if (domains?.length) {
    console.log(`${domains.length} domains will be expiring soon`)
  } else {
    console.log("No domains will be expiring soon")
    crons?.["renewDomainsCron"]?.start()
    return
  }

  const bulkUpdates = []

  for (const domain of domains) {
    const thisMoment = moment()
    const latestMoment = moment(thisMoment).add(30, "days")

    const sslStatus =
      (moment(domain?.SSL?.end_date).isSameOrBefore(thisMoment) &&
        constants.SSL_STATUSES.EXPIRED) ||
      (moment(domain?.SSL?.end_date).isSameOrBefore(latestMoment) &&
        constants.SSL_STATUSES.EXPIRING)

    bulkUpdates.push({
      updateOne: {
        filter: {
          _id: new ObjectId(domain._id),
        },
        update: {
          $set: {
            "SSL.status": sslStatus,
          },
        },
      },
    })
  }

  if (bulkUpdates.length) {
    await db.managementDb?.collection<IDomain>("domains").bulkWrite(bulkUpdates)
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
  crons?.["renewDomainsCron"]?.start()
}

const bulkApplySSLCer = async () => {
  console.log("bulk applying ssl cer")
  crons?.["bulkApplySSLCron"]?.stop()

  crons?.["bulkApplySSLCron"]?.start()
}

export default initializeDomainCrons
