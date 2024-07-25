import express, { Router } from 'express'
import { API } from '../../types/types'
import { checkDockerHubWebhookEnabled } from '../../middleware/checkWebhookEnabled'
import VersionService from '../../services/versionService'
import { db } from '../../db'
import IVersion from '../../schemas/Versions'
import { ObjectId } from 'mongodb'
import { io } from '../../init/sockets'
import { VersionEvents } from 'types/sockets'
import constants from '../../helpers/constants'

export default (app: Router, use: Function) => {
  const router = Router()

  app.use('/dockerHub', router) // /webhooks/dockerHub

  router.post('/', express.json(), use(checkDockerHubWebhookEnabled), use(handlePost))
}

const handlePost: API = async (req, res) => {
  if (req.body?.push_data?.tag) {
    const versionService = new VersionService(req.body?.application_id)
    // Check if version already exists
    const versionResult = await db.managementDb?.collection<IVersion>('versions').findOne({
      application_id: new ObjectId(req.body?.application_id),
      namespace: req.body?.repository?.namespace,
      repository: req.body?.repository?.name,
      tag: req.body?.push_data?.tag,
    })

    let versionId: ObjectId | undefined = versionResult?._id

    if (!versionResult) {
      const version = await versionService.createVersion(
        {
          namespace: req.body?.repository?.namespace,
          repository: req.body?.repository?.name,
          tag: req.body?.push_data?.tag,
        },
        true,
      )

      versionId = version?.version?._id
    } else {
      // Update version
      await db.managementDb?.collection<IVersion>('versions').updateOne(
        {
          _id: versionResult._id,
        },
        {
          $set: { updated_at: new Date() },
        },
      )
    }

    io.io?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS)?.emit(VersionEvents.VERSION_WEBHOOK, versionId)
  }

  res.sendStatus(200)
}
