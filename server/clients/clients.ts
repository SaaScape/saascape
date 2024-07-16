/*
 * Copyright SaaScape (c) 2024.
 */

import { db } from '../db'
import { IServer } from '../schemas/Servers'
import constants from '../helpers/constants'
import DockerService from '../services/dockerService'
import { IDockerClients, IInstanceClients, ISSHClients } from '../interfaces/clients'
import SSHService from '../services/sshService'
import { decipherData } from '../helpers/utils'
import Dockerode from 'dockerode'
import IInstance, { instanceDbStatus } from 'types/schemas/Instances'
import Instance from '../modules/instance'

const clients: { docker: IDockerClients; ssh: ISSHClients; instance: IInstanceClients } = {
  docker: {},
  ssh: {},
  instance: {},
}
export const initializeDockerClients = async () => {
  console.log('Initializing docker clients')
  const servers = await db.managementDb
    ?.collection<IServer>('servers')
    .find({
      status: constants.STATUSES.ACTIVE_STATUS,
      'linked_ids.name': constants.INTEGRATIONS.DOCKER,
    })
    .toArray()

  for (const server of servers || []) {
    try {
      const dockerService = new DockerService(server._id)
      const dockerClient = await dockerService.getDockerClient()
      clients.docker[server?._id?.toString()] = dockerClient
    } catch (err) {
      console.warn(err)
    }
  }
}

export const initializeSSHClients = async () => {
  console.log('Initializing ssh clients')
  const servers = await db.managementDb
    ?.collection<IServer>('servers')
    .find({
      status: constants.STATUSES.ACTIVE_STATUS,
    })
    .toArray()

  for (const server of servers || []) {
    try {
      const adminUsername = decipherData(server?.admin_username?.encryptedData, server?.admin_username?.iv)
      const privateKey = decipherData(server?.private_key?.encryptedData, server?.private_key?.iv)

      const ssh = new SSHService({
        host: server?.server_ip_address,
        port: server?.server_ssh_port,
        username: adminUsername,
        privateKey,
      })

      clients.ssh[server?._id?.toString()] = ssh

      // Connection even listeners here
      ssh.client.connection?.on('close', async () => {
        console.log('connection to ssh client, closed. Attempting to reconnect')
        await ssh.connect()
      })
      await ssh.connect()
    } catch (err) {
      console.warn(err)
    }
  }
}

export const initializeInstanceClients = async () => {
  console.log('Initializing instance clients')

  const instances = (await db.managementDb
    ?.collection<IInstance>('instances')
    .aggregate([
      {
        $match: {
          status: {
            $in: [instanceDbStatus.ACTIVE, instanceDbStatus.PENDING_DEPLOYMENT, instanceDbStatus.PENDING_REMOVAL],
          },
        },
      },
      { $lookup: { from: 'domains', localField: 'domain_id', foreignField: '_id', as: 'domain' } },
      { $set: { domain: { $first: '$domain' } } },
    ])
    .toArray()) as IInstance[]

  for (const instance of instances || []) {
    try {
      if (clients.instance[instance?._id?.toString()]) {
        clients.instance[instance?._id?.toString()].instance = instance
        continue
      }
      const instanceClient = new Instance(instance)
      clients.instance[instance?._id?.toString()] = instanceClient
      await instanceClient.getServiceData()
    } catch (err) {
      console.warn('Error initialising instance clients', err)
    }
  }

  console.log('Instance clients have been initialized')
}

const initializeClients = async (type: 'background' | 'primary') => {
  if (type === 'background') {
    await Promise.allSettled([initializeDockerClients(), initializeSSHClients(), initializeInstanceClients()])
  } else {
    await Promise.allSettled([initializeDockerClients(), initializeSSHClients()])
  }
  console.log('Clients have been initialized')
}

const getAllClients = async (
  type: 'docker' | 'ssh',
  swarmRole?: 'manager' | 'worker',
  options?: { swarmId?: string },
) => {
  const returnClients = []
  for (const client of Object.values(clients[type])) {
    try {
      switch (type) {
        case 'docker':
          const dockerClient = client as Dockerode

          await dockerClient.ping()
          if (swarmRole) {
            const dockerInfo = await dockerClient.info()
            const {
              NodeID,
              RemoteManagers,
              Cluster: { ID },
            } = dockerInfo?.Swarm
            const isManager = RemoteManagers?.some((manager: any) => manager?.NodeID === NodeID)

            if (options?.swarmId && options?.swarmId !== ID) continue
            if (swarmRole === 'manager' && !isManager) continue
            if (swarmRole === 'worker' && isManager) continue
          }

          returnClients.push(client)
        case 'ssh':
          returnClients.push(client)
      }
    } catch (err) {
      console.log(err)
    }
  }
  return returnClients
}

const getClient = async (
  type: 'docker' | 'ssh',
  swarmRole?: 'manager' | 'worker',
  options?: { swarmId?: string },
): Promise<Dockerode | SSHService | undefined> => {
  for (const client of Object.values(clients[type])) {
    try {
      switch (type) {
        case 'docker':
          const dockerClient = client as Dockerode

          await dockerClient.ping()
          if (swarmRole) {
            const dockerInfo = await dockerClient.info()
            const {
              NodeID,
              RemoteManagers,
              Cluster: { ID },
            } = dockerInfo?.Swarm
            const isManager = RemoteManagers?.some((manager: any) => manager?.NodeID === NodeID)

            if (options?.swarmId && options?.swarmId !== ID) continue
            if (swarmRole === 'manager' && !isManager) continue
            if (swarmRole === 'worker' && isManager) continue
          }

          return client
        case 'ssh':
          return client
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export { clients, getClient, getAllClients }
export default initializeClients
