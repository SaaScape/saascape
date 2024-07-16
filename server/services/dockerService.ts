import { ObjectId } from 'mongodb'
import { IServer } from '../schemas/Servers'
import { db } from '../db'
import { decipherData, encryptData } from '../helpers/utils'
import Dockerode from 'dockerode'
import { ISwarm } from 'types/schemas/Swarms'
import constants from '../helpers/constants'
import { IIntegration } from '../schemas/Integrations'
import { misc, SwarmNodeTypes } from 'types/enums'

export default class DockerService {
  server_id: ObjectId
  server?: IServer
  constructor(server_id: string | ObjectId) {
    this.server_id = new ObjectId(server_id)
  }
  async #getCertificateInfo() {
    const server =
      this.server || (await db.managementDb?.collection<IServer>('servers').findOne({ _id: this.server_id }))

    if (!server) throw new Error('Server not found')
    const { docker_data } = server
    if (!docker_data) throw new Error('Docker data not found')
    const { certs } = docker_data
    if (!certs) throw new Error('Certs not found')

    const decipheredCerts = {
      ca: decipherData(certs?.ca?.encryptedData, certs?.ca?.iv),
      server: {
        cert: decipherData(certs?.server?.cert?.encryptedData, certs?.server?.cert?.iv),
        key: decipherData(certs?.server?.key?.encryptedData, certs?.server?.key?.iv),
      },
      client: {
        cert: decipherData(certs?.client?.cert?.encryptedData, certs?.client?.cert?.iv),
        key: decipherData(certs?.client?.key?.encryptedData, certs?.client?.key?.iv),
      },
    }
    return { certs: decipheredCerts }
  }

  async getDockerClient() {
    const server =
      this.server || (await db.managementDb?.collection<IServer>('servers').findOne({ _id: this.server_id }))

    if (!server) throw new Error('Server not found')
    this.server = server

    const { certs } = await this.#getCertificateInfo()

    const dockerClient = new Dockerode({
      host: server.server_ip_address,
      port: process.env.DOCKER_API_PORT || 2376,
      ca: certs.ca,
      cert: certs.client.cert,
      key: certs.client.key,
    })

    return dockerClient
  }

  async getDockerAvailability() {
    const dockerClient = await this.getDockerClient()
    const data = await dockerClient.ping()
    return data
  }

  async getSwarmManagers(swarmId: ObjectId) {
    const servers = await db.managementDb
      ?.collection<IServer>('servers')
      ?.aggregate([
        {
          $match: {
            linked_ids: {
              $elemMatch: {
                name: constants.INTEGRATIONS.DOCKER,
              },
            },
            status: constants.STATUSES.ACTIVE_STATUS,
            availability: constants.AVAILABILITY.ONLINE,
          },
        },
        {
          $lookup: {
            from: 'integrations',
            localField: 'linked_ids.integration_id',
            foreignField: '_id',
            as: 'integrations',
          },
        },
        {
          $set: {
            integrations: {
              $filter: {
                input: '$integrations',
                as: 'integration',
                cond: {
                  $eq: ['$$integration.name', constants.INTEGRATIONS.DOCKER],
                },
                limit: 1,
              },
            },
          },
        },
        {
          $set: {
            docker_integration: { $first: '$integrations' },
          },
        },
        {
          $match: {
            'docker_integration.config.swarm.swarm_id': swarmId,
            'docker_integration.config.swarm.node_type': constants.SWARM_NODE_TYPES.MANAGER,
          },
        },
      ])
      .toArray()

    return servers as IServer[]
  }

  async joinSwarm(swarmId: ObjectId, nodeType: SwarmNodeTypes) {
    const dockerClient = await this.getDockerClient()
    const swarm = (await this.getSwarms(swarmId))?.[0]
    if (!swarm) throw new Error('Swarm not found')

    const swarmManagers = await this.getSwarmManagers(swarmId)

    if (!swarmManagers?.length) throw new Error('No swarm managers found, unable to join existing Swarm')

    let joinResult

    const managerRemoteAddresses = swarmManagers.map((server) => `${server.server_ip_address}:2377`)

    const encryptedJoinToken = swarm?.join_tokens?.[nodeType]
    const joinToken = `${decipherData(encryptedJoinToken?.encryptedData, encryptedJoinToken?.iv)}`

    joinResult = await dockerClient.swarmJoin({
      listenAddr: `0.0.0.0:2377`,
      advertiseAddr: `${this.server?.server_ip_address}:2377`,
      joinToken,
      RemoteAddrs: managerRemoteAddresses,
    })

    const dockerLinkedId = this.server?.linked_ids?.find(
      (linkedIdObj) => linkedIdObj?.name === constants.INTEGRATIONS.DOCKER,
    )

    if (!dockerLinkedId) {
      throw new Error('Docker integration not found, unable to update Swarm data')
    }

    await db.managementDb?.collection<IIntegration>('integrations').updateOne(
      {
        _id: dockerLinkedId?.integration_id,
      },
      {
        $set: {
          'config.swarm': {
            swarm_id: swarm?._id,
            node_type: nodeType,
          },
        },
      },
    )
  }

  async leaveSwarm(swarmId: ObjectId) {}
  async createSwarm() {
    const dockerClient = await this.getDockerClient()
    await dockerClient.swarmInit({
      advertiseAddr: `${this.server?.server_ip_address}:2377`,
      listenAddr: '0.0.0.0:2377',
      // autolock: true,
    })
    const swarm = await dockerClient.swarmInspect()

    const joinTokens = {
      manager: encryptData(swarm.JoinTokens.Manager),
      worker: encryptData(swarm.JoinTokens.Worker),
    }

    const payload = {
      name: `swarm-${swarm.ID}`,
      ID: swarm.ID,
      join_tokens: {
        manager: {
          encryptedData: joinTokens.manager.encryptedData,
          iv: joinTokens.manager.iv,
        },
        worker: {
          encryptedData: joinTokens.worker.encryptedData,
          iv: joinTokens.worker.iv,
        },
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    const response = await db.managementDb?.collection<ISwarm>('swarms').insertOne(payload)

    const dockerLinkedId = this.server?.linked_ids?.find(
      (linkedIdObj) => linkedIdObj?.name === constants.INTEGRATIONS.DOCKER,
    )

    if (!dockerLinkedId) {
      throw new Error('Docker integration not found, unable to update Swarm data')
    }
    await db.managementDb?.collection<IIntegration>('integrations').updateOne(
      {
        _id: dockerLinkedId?.integration_id,
      },
      {
        $set: {
          'config.swarm': {
            swarm_id: new ObjectId(response?.insertedId),
            node_type: SwarmNodeTypes.MANAGER,
          },
        },
      },
    )

    await dockerClient
      .createNetwork({
        Name: misc.DOCKER_SAASCAPE_NETWORK,
        Driver: 'overlay',
      })
      .catch((err) => {
        console.log('Error creating network', err)
      })

    return { swarm, document: { ...payload, _id: response?.insertedId } }
  }

  async getSwarms(id?: ObjectId) {
    const findObj: { [key: string]: any } = {}

    if (id) findObj['_id'] = id
    const swarms = await db.managementDb?.collection<ISwarm>('swarms').find(findObj).toArray()

    return swarms
  }
}
