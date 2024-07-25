import { db } from '../db'
import { IApplication } from '../schemas/Applications'
import { API } from '../types/types'

export const checkDockerHubWebhookEnabled: API = async (req, res, next) => {
  //   Find application by config
  const application = await db.managementDb?.collection<IApplication>('applications').findOne({
    'config.version_config.namespace': req?.body?.repository?.namespace,
    'config.version_config.repository': req?.body?.repository?.name,
  })

  if (!application) {
    return res.status(204).json({ message: 'Application not found' })
  }

  if (!application?.config?.version_config?.docker_hub_webhooks) {
    return res.status(204).json({ message: 'Webhooks not enabled' })
  }

  req.body.application_id = application?._id
  next?.()
}
