/*
 * Copyright SaaScape (c) 2024.
 */

import { db } from '../db'
import { IIntegration } from '../schemas/Integrations'
import constants from '../helpers/constants'

export default class OVHService {
  constructor() {}

  async getIntegration() {
    const ovhIntegration = await db.managementDb?.collection<IIntegration>('integrations').findOne({
      name: constants.INTEGRATIONS.OVH,
      status: constants.STATUSES.ACTIVE_STATUS,
    })

    return ovhIntegration
  }
}
