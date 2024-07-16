import { db } from "../db"
import constants from "../helpers/constants"
import { IIntegration } from "../schemas/Integrations"

export default class IntegrationService {
  constructor() {}

  async getIntegrations() {
    const allIntegrations = [
      constants.INTEGRATIONS.DOCKER,
      constants.INTEGRATIONS.DOCKER_HUB,
      constants.INTEGRATIONS.STRIPE,
    ]
    const enabledIntegrations = {
      [constants.INTEGRATIONS.DOCKER]: false,
      [constants.INTEGRATIONS.DOCKER_HUB]: false,
      [constants.INTEGRATIONS.STRIPE]: false,
    }
    const integrations: { [key: string]: any[] } = {}

    const foundIntegrations =
      (await db.managementDb
        ?.collection<IIntegration>("integrations")
        .find({
          name: { $in: allIntegrations },
          status: constants.STATUSES.ACTIVE_STATUS,
        })
        .toArray()) || []

    for (const integration of foundIntegrations) {
      integrations[integration?.name] ??= []
      const obj: { [key: string]: any } = {
        _id: integration?._id,
        status: integration?.status,
        type: integration?.type,
        module: integration?.module,
        created_at: integration?.created_at,
        updated_at: integration?.updated_at,
      }

      switch (integration?.name) {
        case constants.INTEGRATIONS.DOCKER:
          obj.config = {
            swarm: {
              swarm_id: integration?.config?.swarm?.swarm_id,
              node_type: integration?.config?.swarm?.node_type,
            },
          }
          break
      }
      integrations[integration?.name].push(obj)
      enabledIntegrations[integration?.name] = true
    }

    return { integrations, enabledIntegrations }
  }
}
