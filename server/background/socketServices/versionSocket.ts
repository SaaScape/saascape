/*
 * Copyright SaaScape (c) 2024.
 */

import constants from '../../helpers/constants'
import { db } from '../../db'
import IInstance from 'types/schemas/Instances'
import { ObjectId } from 'mongodb'
import { deployInstanceQueueProducer } from '../../queue/producers/instanceProducers'
import { VersionEvents } from 'types/sockets'
import IVersion from '../../schemas/Versions'

export default class VersionSocket {
  data?: any
  event?: string
  name: string
  constructor(data?: any, event?: string) {
    this.data = data
    this.event = event
    this.name = constants.SOCKET_ROUTES.VERSION
  }

  events: { [event: string]: () => void } = {
    [VersionEvents.VERSION_WEBHOOK]: () => this.handleUpdatedVersion(),
  }

  async handleUpdatedVersion() {
    const versionId = this.data

    const version = await db.managementDb?.collection<IVersion>('versions').findOne({
      _id: new ObjectId(versionId),
    })

    if (!version) {
      throw new Error('Version not found when retrieving version from webhook')
    }

    const instances = await db.managementDb
      ?.collection<IInstance>('instances')
      .find({
        application_id: version?.application_id,
        version_id: new ObjectId(versionId),
      })
      .toArray()

    for (const instance of instances || []) {
      await deployInstanceQueueProducer({ instance_id: instance?._id?.toString() })
    }
  }
}
