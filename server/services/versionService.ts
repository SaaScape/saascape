import Dockerode from "dockerode"
import { getClient } from "../clients/clients"
import IVersion from "../schemas/Versions"
import { ObjectId } from "mongodb"
import { db } from "../db"

interface IClientData {
  namespace: string
  repository: string
  tag: string
}
export default class VersionService {
  async getVersions(): Promise<IVersion[]> {
    return []
  }

  pullImage(
    dockerClient: Dockerode,
    namespace: string,
    repository: string,
    tag: string
  ) {
    return new Promise<{ tag: string; image: string }>(
      async (resolve, reject) => {
        let repo = `${repository}`
        if (namespace) {
          repo = `${namespace}/${repository}`
        }
        const dockerImage = `${repo}:${tag}`
        const newImageTag = `${tag}-${Date.now()}`

        dockerClient.pull(dockerImage, {}, (err, stream) => {
          if (err) {
            reject(err)
          }
          const onFinished = async (err: any, output: any) => {
            if (err) reject(err)

            await dockerClient
              ?.getImage(dockerImage)
              .tag({ repo, tag: newImageTag })

            console.log("output", output)
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
      }
    )
  }
  async createVersion(data: IClientData) {
    console.log(data)
    // Right now we are retrieving the docker client but without the ability to specify from which swarm. This will be vital when we have more than one swarm

    const dockerClient = (await getClient("docker", "manager")) as Dockerode
    if (!dockerClient) throw { showError: "Docker client not found" }

    const imagePullResult = await this.pullImage(
      dockerClient,
      data.namespace,
      data.repository,
      data.tag
    ).catch((err) => {
      throw { showError: "Unable to pull image" }
    })

    console.log(imagePullResult?.image)

    const versionPayload: IVersion = {
      _id: new ObjectId(),
      namespace: data.namespace,
      repository: data.repository,
      tag: data.tag,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const version = await db.managementDb
      ?.collection<IVersion>("versions")
      .insertOne(versionPayload)

    if (!version?.insertedId) throw { showError: "Unable to create version" }
    return { version: versionPayload }
  }
}
