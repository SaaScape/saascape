import express, { Router } from "express"
import { API } from "../../types/types"
import { checkDockerHubWebhookEnabled } from "../../middleware/checkWebhookEnabled"
import VersionService from "../../services/versionService"
import { db } from "../../db"
import IVersion from "../../schemas/Versions"
import { ObjectId } from "mongodb"

export default (app: Router, use: Function) => {
  const router = Router()

  app.use("/dockerHub", router) // /webhooks/dockerHub

  router.post(
    "/",
    express.json(),
    use(checkDockerHubWebhookEnabled),
    use(handlePost)
  )
}

const handlePost: API = async (req, res) => {
  if (req.body?.push_data?.tag) {
    const versionService = new VersionService(req.body?.application_id)
    // Check if version already exists
    const versionResult = await db.managementDb
      ?.collection<IVersion>("versions")
      .findOne({
        application_id: new ObjectId(req.body?.application_id),
        namespace: req.body?.repository?.namespace,
        repository: req.body?.repository?.name,
        tag: req.body?.push_data?.tag,
      })

    if (!versionResult) {
      await versionService.createVersion(
        {
          namespace: req.body?.repository?.namespace,
          repository: req.body?.repository?.name,
          tag: req.body?.push_data?.tag,
        },
        true
      )
    } else {
      // Update version
      await db.managementDb?.collection<IVersion>("versions").updateOne(
        {
          _id: versionResult._id,
        },
        {
          $set: { updated_at: new Date() },
        }
      )
    }

    // Do some magic here with regards to sending to background server to complete tasks such as
    // * Instance updating
    // * Docker image pulling
    // * Email/ Slack notification
    // * etc.
  }

  res.sendStatus(200)
}
