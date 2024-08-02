/*
 * Copyright SaaScape (c) 2024.
 */

import Dockerode from 'dockerode'
import { getClient } from '../clients/clients'
import IVersion from '../schemas/Versions'
import { ObjectId } from 'mongodb'
import { db } from '../db'
import { IApplication } from 'types/schemas/Applications'
import { decipherData } from '../helpers/utils'
import Pagination from '../helpers/pagination'
import constants from '../helpers/constants'

interface IClientData {
  namespace: string
  repository: string
  tag: string
}
export default class VersionService {
  applicationId: string
  constructor(applicationId: string) {
    this.applicationId = applicationId
  }
  async getVersions(query: any): Promise<{ data: any }> {
    const pagination = new Pagination(query)

    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
      application_id: new ObjectId(this.applicationId),
    }

    if (query?.searchValue) {
      findObj['$or'] = [
        { namespace: { $regex: query.searchValue, $options: 'i' } },
        { tag: { $regex: query.searchValue, $options: 'i' } },
        { repository: { $regex: query.searchValue, $options: 'i' } },
      ]
    }

    const versions = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection('versions'),
      findObj,
    })

    return {
      data: versions,
    }
  }

  pullImage(
    application: IApplication,
    dockerClient: Dockerode,
    namespace: string,
    repository: string,
    tag: string,
    timeStamp: number = Date.now(),
  ) {
    return new Promise<{ tag: string; image: string }>(async (resolve, reject) => {
      let repo = `${repository}`
      if (namespace) {
        repo = `${namespace}/${repository}`
      }
      const dockerImage = `${repo}:${tag}`
      const newImageTag = `${tag}-${timeStamp}`

      const encryptedData = {
        username: application.config?.version_config?.docker_hub_username,
        password: application.config?.version_config?.docker_hub_password,
      }

      const authconfig = {
        username:
          encryptedData.username && decipherData(encryptedData.username?.encryptedData, encryptedData.username?.iv),
        password:
          encryptedData.password && decipherData(encryptedData.password?.encryptedData, encryptedData.password?.iv),
      }

      dockerClient.pull(dockerImage, { authconfig }, (err, stream) => {
        if (err) {
          reject(err)
        }
        const onFinished = async (err: any, output: any) => {
          if (err) reject(err)

          await dockerClient?.getImage(dockerImage).tag({ repo, tag: newImageTag })

          console.log('output', output)
          resolve({ tag: newImageTag, image: `${repo}:${newImageTag}` })
        }
        const onProgress = (event: any) => {}

        try {
          dockerClient?.modem?.followProgress(stream, onFinished, onProgress)
        } catch (err) {
          console.log(err)
          reject(err)
        }
      })
    })
  }
  async createVersion(data: IClientData, isWebhook?: boolean) {
    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: new ObjectId(this.applicationId) })
    if (!application) throw { showError: 'Application not found' }

    if (!isWebhook) {
      // Right now we are retrieving the docker client but without the ability to specify from which swarm. This will be vital when we have more than one swarm
      const dockerClient = (await getClient('docker', 'manager')) as Dockerode
      if (!dockerClient) throw { showError: 'Docker client not found' }
      const imagePullResult = await this.pullImage(
        application,
        dockerClient,
        data.namespace,
        data.repository,
        data.tag,
      ).catch((err) => {
        throw { showError: 'Unable to pull image' }
      })
    }

    const versionPayload: IVersion = {
      _id: new ObjectId(),
      namespace: data.namespace,
      repository: data.repository,
      tag: data.tag,
      application_id: new ObjectId(this.applicationId),
      status: constants.STATUSES.ACTIVE_STATUS,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const version = await db.managementDb?.collection<IVersion>('versions').insertOne(versionPayload)

    if (!version?.insertedId) throw { showError: 'Unable to create version' }
    return { version: versionPayload }
  }

  async getVersionById(versionId: string) {
    const version = await db.managementDb?.collection<IVersion>('versions').findOne({
      application_id: new ObjectId(this.applicationId),
      _id: new ObjectId(versionId),
    })

    if (!version) throw { showError: 'Version not found' }
    return { version }
  }
}
