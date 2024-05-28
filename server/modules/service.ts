/*
 * Copyright SaaScape (c) 2024.
 */

import IInstance, { InstanceServiceStatus, IReplicaStates } from 'types/schemas/Instances'
import { getClient } from '../clients/clients'
import { db } from '../db'
import { ISwarm } from 'types/schemas/Swarms'
import { ObjectId } from 'mongodb'
import Dockerode from 'dockerode'
import { decipherData } from '../helpers/utils'
import lodash from 'lodash'
import VersionService from '../services/versionService'
import { IApplication } from '../schemas/Applications'
import IVersion from '../schemas/Versions'
import constants from '../helpers/constants'
import Instance from './instance'
import { ILinkedId } from '../interfaces/interfaces'
import DomainService, { DecipheredCertificates } from '../services/domainsService'
import { instanceHealth, InstanceVariables } from 'types/enums'
import moment from 'moment'

// TODO: Instead of deleting secret, update it when forcing update

export interface IHealthObj {
  replicaStates: IReplicaStates
  instanceHealthStatus: instanceHealth
  instanceStatus: InstanceServiceStatus
}

export default class Service {
  instanceClient: Instance
  instanceStatusMap: { [state: string]: InstanceServiceStatus } = {}
  constructor(client: Instance) {
    this.instanceClient = client
    this.instanceStatusMap = {
      running: InstanceServiceStatus.RUNNING,
      stopped: InstanceServiceStatus.STOPPED,
      failed: InstanceServiceStatus.FAILED,
      shutdown: InstanceServiceStatus.STOPPED,
      starting: InstanceServiceStatus.STARTING,
      ready: InstanceServiceStatus.STARTING,
      preparing: InstanceServiceStatus.STARTING,
    }
  }

  async getDockerClient() {
    const swarm = await db.managementDb
      ?.collection<ISwarm>('swarms')
      .findOne({ _id: new ObjectId(this.instanceClient.instance?.swarm_id) })

    const dockerClient = (await getClient('docker', 'manager', { swarmId: swarm?.ID })) as Dockerode
    if (!dockerClient) {
      throw new Error('Docker client not found')
    }
    return dockerClient
  }

  async deleteSecret(id: string) {
    const dockerClient = await this.getDockerClient()
    const result = await dockerClient.getSecret(id).remove()
    if (result) {
      console.log('Secret deleted successfully')
      await db.managementDb
        ?.collection<IInstance>('instances')
        .updateOne({ _id: this.instanceClient.instance?._id }, { $unset: { [`config.secrets_config.${id}`]: '' } })
    }
  }

  async createCustomSecret(secretName: string, secretValue: string) {
    console.log('creating custom secret')

    const dockerClient = await this.getDockerClient()

    const secret = await dockerClient.createSecret({
      Name: secretName,
      Labels: { instanceId: this.instanceClient.instance?._id?.toString(), certificate: 'true' },
      Data: Buffer.from(secretValue).toString('base64'),
    })

    if (!secret?.id) {
      throw new Error('Docker secret not created')
    }

    return (await this.getSecretById(secret.id)) as Dockerode.Secret
  }

  async updateSecret(secretId: string, name: string, value: string) {
    const secret = await this.getSecretById(secretId)

    if (!secret || !(secret instanceof Dockerode.Secret)) {
      throw new Error('Docker secret not found')
    }

    const updateResult = await secret
      .update({
        Name: name,
        Labels: { instanceId: this.instanceClient.instance?._id?.toString(), secretId },
        Data: Buffer.from(value).toString('base64'),
      })
      .catch((err) => {
        console.warn('Error updating secret', err)
        return false
      })

    if (!updateResult) {
      throw new Error('Docker secret not updated')
    }

    return updateResult.id
  }

  async createSecret(
    id: string,
    secret: IInstance['config']['secrets_config'][string],
    dockerClient: Dockerode,
    forceUpdate: boolean = false,
    bulkUpdates?: any[],
  ) {
    const decodedValue = decipherData(secret.value.encryptedData, secret.value.iv)
    const secretName = `${this.instanceClient.instance?._id?.toString()}-${lodash.snakeCase(secret.name)}`

    if (secret.docker_secret_id) {
      if (!forceUpdate) {
        const dockerSecret = await this.getSecretById(secret.docker_secret_id)
        if (dockerSecret) return secret.docker_secret_id
      }
      return await this.updateSecret(secret.docker_secret_id, secretName, decodedValue).catch((err) => {
        console.warn('unable to update secret', err)
        return
      })
    }

    const dockerSecret = await dockerClient.createSecret({
      Name: secretName,
      Labels: { instanceId: this.instanceClient.instance?._id?.toString(), secretId: id },
      Data: Buffer.from(decodedValue).toString('base64'),
    })

    if (!dockerSecret?.id) {
      throw new Error('Docker secret not created')
    }

    if (bulkUpdates) {
      bulkUpdates.push({
        updateOne: {
          filter: { _id: this.instanceClient.instance?._id },
          update: { $set: { [`config.secrets_config.${id}.docker_secret_id`]: dockerSecret.id } },
        },
      })
    } else {
      await db.managementDb
        ?.collection<IInstance>('instances')
        .updateOne(
          { _id: this.instanceClient.instance?._id },
          { $set: { [`config.secrets_config.${id}.docker_secret_id`]: dockerSecret.id } },
        )
    }

    return dockerSecret.id
  }

  async getDomainSSLSecrets() {
    const domainService = new DomainService()
    const certificates: DecipheredCertificates | false = await domainService
      .getSSLCerts(this.instanceClient.instance?.domain_id)
      .catch((err) => false)
    if (!certificates) return
    // Find secret ids for certificates or create new ones
    const dockerClient = await this.getDockerClient()
    const secretNameMap = {
      cert: `${this.instanceClient.instance._id.toString()}-SAASCAPE_SSL_CERT`,
      key: `${this.instanceClient.instance._id.toString()}-SAASCAPE_SSL_KEY`,
      csr: `${this.instanceClient.instance._id.toString()}-SAASCAPE_SSL_CSR`,
    }
    const foundSecrets = await dockerClient.listSecrets({
      filters: {
        names: [secretNameMap.cert, secretNameMap.csr, secretNameMap.key],
      },
    })
    const secrets = {
      cert:
        foundSecrets.find((secret) => secret.Spec?.Name === secretNameMap.cert) ||
        (await this.createCustomSecret(secretNameMap.cert, certificates?.cert).catch((err) => console.warn(err))),
      key:
        foundSecrets.find((secret) => secret.Spec?.Name === secretNameMap.key) ||
        (await this.createCustomSecret(secretNameMap.key, certificates?.key).catch((err) => console.warn(err))),
      csr:
        foundSecrets.find((secret) => secret.Spec?.Name === secretNameMap.csr) ||
        (await this.createCustomSecret(secretNameMap.csr, certificates?.csr).catch((err) => console.warn(err))),
    }

    return secrets
  }

  async createSecrets() {
    await this.instanceClient.updateInstanceDetails()
    const bulkUpdates: any[] = []

    const dockerClient = await this.getDockerClient()
    for (const [id, secret] of Object.entries(this.instanceClient.instance?.config?.secrets_config) || []) {
      try {
        await this.createSecret(id, secret, dockerClient, false, bulkUpdates)
      } catch (err) {
        console.warn('Error creating secret', err)
      }
    }
    bulkUpdates.length && (await db.managementDb?.collection<IInstance>('instances').bulkWrite(bulkUpdates))
  }

  private async getSecretNames() {
    const secretNames = []
    for (const value of Object.values(this.instanceClient.instance.config.secrets_config)) {
      secretNames.push(value.name)
    }
    secretNames.push(
      InstanceVariables.SAASCAPE_SSL_CA,
      InstanceVariables.SAASCAPE_SSL_CERT,
      InstanceVariables.SAASCAPE_SSL_KEY,
    )
    return secretNames
  }

  async getEnvironmentVariables() {
    const { environment_config } = this.instanceClient.instance.config
    const environmentVariables = []
    for (const value of Object.values(environment_config)) {
      environmentVariables.push(`${value.name}=${value.value}`)
    }
    // TODO: Get database name from database collection here
    const dbName = this.instanceClient.instance.is_custom_database ? this.instanceClient.instance.database : ''
    environmentVariables.push(
      ...[
        `${InstanceVariables.SAASCAPE_PORT}=${this.instanceClient.instance.port}`,
        `${InstanceVariables.SAASCAPE_DATABASE_NAME}=${dbName}`,
        `${InstanceVariables.SAASCAPE_SECRET_NAMES}=${(await this.getSecretNames()).join(',')}`,
      ],
    )
    return environmentVariables
  }

  async getSecrets() {
    const secrets = []
    const dockerClient = await this.getDockerClient()
    for (const [key, value] of Object.entries(this.instanceClient.instance.config.secrets_config)) {
      const { docker_secret_id } = value
      try {
        if (!docker_secret_id) {
          const secret = await this.createSecret(key, value, dockerClient, true)
          value.docker_secret_id = secret
        }
        let dockerSecret = await dockerClient
          .getSecret(value.docker_secret_id || '')
          .inspect()
          .catch((err) => {})
        if (!dockerSecret) {
          // Create secret
          const secret = await this.createSecret(key, value, dockerClient, true)
          value.docker_secret_id = secret
          dockerSecret = await dockerClient.getSecret(secret).inspect()
        }

        const secret = {
          File: {
            Name: `/run/secrets/${value.name}`,
            UID: '0',
            GID: '0',
            Mode: 444,
          },
          SecretId: dockerSecret.ID,
          SecretName: dockerSecret.Spec?.Name,
        }
        secrets.push(secret)
      } catch (err) {
        console.log('error getting secret', err)
      }
    }

    try {
      const sslSecrets = await this.getDomainSSLSecrets()
      secrets.push(
        ...Object.entries(sslSecrets || {}).map(([sslType, secret]) => ({
          File: {
            Name: `/run/secrets/${`SAASCAPE_SSL_${sslType.toUpperCase()}`}`,
            UID: '0',
            GID: '0',
            Mode: 444,
          },
          SecretId: secret?.ID,
          SecretName: secret?.Spec?.Name,
        })),
      )
    } catch (err) {
      console.log('error getting secret', err)
    }

    console.log(secrets)
    return secrets
  }

  async getSecretById(id: string) {
    const dockerClient = await this.getDockerClient()
    return await dockerClient
      .getSecret(id)
      .inspect()
      .catch((err) => false)
  }

  async downloadImage(versionOverride?: IVersion, dockerClient?: Dockerode) {
    dockerClient ??= await this.getDockerClient()
    const image = `${this.instanceClient.instance.version?.namespace}/${this.instanceClient.instance.version?.repository}:${this.instanceClient.instance.version?.tag}`

    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: this.instanceClient.instance?.application_id })

    const version =
      versionOverride ||
      (await db.managementDb
        ?.collection<IVersion>('versions')
        .findOne({ _id: this.instanceClient.instance?.version_id }))

    if (!application) {
      throw new Error('Application not found')
    }
    if (!version) {
      throw new Error('Version not found')
    }

    const { namespace, repository, tag } = version

    const versionService = new VersionService(application?._id?.toString())

    const { tag: newTag, image: newImage } = await versionService.pullImage(
      application,
      dockerClient,
      namespace,
      repository,
      tag,
    )
    return newImage
  }

  private async checkServiceExists() {
    await this.instanceClient.updateInstanceDetails()
    const dockerClient = await this.getDockerClient()
    if (!this.instanceClient.serviceId) return false
    const service = await dockerClient
      .getService(this.instanceClient.serviceId)
      .inspect()
      .catch((err) => false)
    return !!service
  }

  async createService() {
    // Check if service exists
    if (await this.checkServiceExists()) {
      console.log('Service already exists')
      return
    }

    // Ensure that instance is in a state where it can be created

    const allowedCreationStates = [
      InstanceServiceStatus.PENDING,
      InstanceServiceStatus.CREATION_FAILED,
      InstanceServiceStatus.STOPPED,
    ]

    if (!allowedCreationStates.includes(this.instanceClient.instance.service_status)) {
      console.warn('Instance is not in a state where it can be created')
      return
    }

    // Create service
    const dockerClient = await this.getDockerClient()
    const image = await this.downloadImage()
    const environmentVariables = [...((await this.getEnvironmentVariables()) || []), ...[`MANAGEMENT_ENGINE=SAASCAPE`]]

    const dockerService = await dockerClient.createService({
      // TODO: Prevent instances from being created with the same name
      // TODO: Allow custom launch commands
      Name: lodash.snakeCase(this.instanceClient.instance?.name),
      Labels: { instanceId: this.instanceClient.instance?._id?.toString() },
      TaskTemplate: {
        ContainerSpec: {
          Image: image,
          Labels: { versionId: this.instanceClient.instance.version_id.toString() },
          Env: environmentVariables,
          Secrets: await this.getSecrets(),
          Command: ['npm', 'start'], //Temp just for testing
        },
        RestartPolicy: {
          Condition: 'any',
        },
      },
      EndpointSpec: {
        Ports: [
          {
            Protocol: 'tcp',
            TargetPort: this.instanceClient.instance.port,
            PublishedPort: this.instanceClient.instance.port,
          },
        ],
      },
      Mode: {
        Replicated: {
          Replicas: this.instanceClient.instance.replicas,
        },
      },
      UpdateConfig: {
        Parallelism: 1,
        Delay: 1000000000,
        FailureAction: 'pause',
        Monitor: 15000000000,
        MaxFailureRatio: 0,
        Order: 'stop-first',
      },
    })

    const serviceLinkedId: ILinkedId = {
      _id: new ObjectId(),
      name: constants.SERVICE,
      id: dockerService.id,
    }

    await db.managementDb
      ?.collection<Instance>('instances')
      .updateOne({ _id: this.instanceClient.instance._id }, { $pull: { linked_ids: { name: constants.SERVICE } } })

    await db.managementDb
      ?.collection<IInstance>('instances')
      .updateOne({ _id: this.instanceClient.instance._id }, { $push: { linked_ids: serviceLinkedId } })

    console.log('Service created successfully')
    await this.instanceClient.updateInstanceDetails()
  }

  async restartService() {
    if (!(await this.checkServiceExists())) {
      console.warn('Service does not exist')
      return
    }
    if (!this.instanceClient.serviceId) return
    const dockerClient = await this.getDockerClient()
    const service = dockerClient.getService(this.instanceClient.serviceId)
    await service.update({ force: true })
  }

  async scale(replicas: number) {
    if (!(await this.checkServiceExists())) {
      console.warn('Service does not exist')
      return
    }
    if (!this.instanceClient.serviceId) return
    const dockerClient = await this.getDockerClient()
    const service = dockerClient.getService(this.instanceClient.serviceId)
    await service.update({ Mode: { Replicated: { Replicas: replicas } } })
  }

  async updateService() {
    if (!(await this.checkServiceExists())) {
      console.warn('Service does not exist')
      return
    }
    if (!this.instanceClient.serviceId) return
    const dockerClient = await this.getDockerClient()
    const service = dockerClient.getService(this.instanceClient.serviceId)
    const environmentVariables = [...((await this.getEnvironmentVariables()) || []), ...[`MANAGEMENT_ENGINE=SAASCAPE`]]
    const secrets = await this.getSecrets()

    await service.update({
      TaskTemplate: {
        ContainerSpec: {
          Env: environmentVariables,
          Secrets: secrets,
          Labels: {
            versionId: this.instanceClient.instance.version_id.toString(),
          },
        },
        EndpointSpec: {
          Ports: [
            {
              Protocol: 'tcp',
              TargetPort: this.instanceClient.instance.port,
              PublishedPort: this.instanceClient.instance.port,
            },
          ],
        },
        Mode: {
          Replicated: {
            Replicas: this.instanceClient.instance.replicas,
          },
        },
      },
    })
  }

  async deployVersion(versionId: ObjectId) {
    if (!this.instanceClient.serviceId) return
    const version = await db.managementDb?.collection<IVersion>('versions').findOne({ _id: versionId })
    if (!version) {
      throw new Error('Version not found')
    }
    const dockerClient = await this.getDockerClient()
    const image = await this.downloadImage(version, dockerClient)
    const service = dockerClient.getService(this.instanceClient.serviceId)
    return await service.update({
      TaskTemplate: { ContainerSpec: { Image: image, Labels: { versionId: versionId.toString() } } },
    })
  }

  async deleteService() {
    if (!(await this.checkServiceExists())) {
      console.warn('Service does not exist')
      return
    }
    if (!this.instanceClient.serviceId) return
    const dockerClient = await this.getDockerClient()
    const service = dockerClient.getService(this.instanceClient.serviceId)
    await service.remove()
  }

  async checkServiceHealth() {
    //   If service has a failure in the last 2 minutes then report not health
    //   If task has been running for more than 2 minutes then report healthy

    const dockerClient = await this.getDockerClient()
    const tasks = await dockerClient.listTasks({ filters: { service: [this.instanceClient.serviceId] } })

    const sortedTasks = tasks.sort((a, b) => {
      return b.Version.Index - a.Version.Index
    })

    const replicaTasks: { [replica: number]: any[] } = {}
    const thisMoment = moment()
    for (const task of sortedTasks) {
      replicaTasks[+task.Slot] ??= []
      replicaTasks[+task.Slot].push(task)
    }

    const replicaCount = this.instanceClient.instance.replicas

    const replicaStates: IReplicaStates = {}

    for (let i = 1; i <= replicaCount; i++) {
      const tasks = replicaTasks[i] || []
      if (!tasks.length) {
        console.log('No tasks found for replica', i)
        continue
      }

      const replicaState = tasks?.[0]?.Status?.State
      const desiredState = tasks?.[0]?.DesiredState

      const { CreatedAt } = tasks[0]
      const createdMoment = moment(CreatedAt)
      const timeDiff = thisMoment.diff(createdMoment, 'minutes')

      // Check if desired state is running and if the task is running
      if (replicaState === 'running' && desiredState === 'running') {
        //   Check if the task has been running for more than 2 minutes
        if (timeDiff > 2) {
          replicaStates[i] = {
            health: instanceHealth.HEALTHY,
            state: replicaState,
            since: createdMoment.toDate(),
          }
        } else {
          replicaStates[i] = {
            health: instanceHealth.UNHEALTHY,
            state: replicaState,
            since: createdMoment.toDate(),
          }
        }
      } else if (desiredState === replicaState) {
        if (timeDiff > 2) {
          replicaStates[i] = {
            health: instanceHealth.HEALTHY,
            state: replicaState,
            since: createdMoment.toDate(),
          }
        } else {
          replicaStates[i] = {
            health: instanceHealth.UNHEALTHY,
            state: replicaState,
            since: createdMoment.toDate(),
          }
        }
      } else {
        replicaStates[i] = {
          health: instanceHealth.UNHEALTHY,
          state: replicaState,
          since: createdMoment.toDate(),
        }
      }
    }

    let instanceHealthStatus: instanceHealth = instanceHealth.UNKNOWN
    let instanceStatus: InstanceServiceStatus = InstanceServiceStatus.UNKNOWN

    let healthyCount = 0
    const instanceStatuses: { [state: string]: number } = {}

    for (const replica of Object.values(replicaStates)) {
      if (replica.health === instanceHealth.HEALTHY) {
        healthyCount++
      }
      instanceStatuses[replica.state] ??= 0
    }

    // Set Health
    if (healthyCount === replicaCount) {
      instanceHealthStatus = instanceHealth.HEALTHY
    } else if (healthyCount > 0) {
      instanceHealthStatus = instanceHealth.PARTIALLY_HEALTHY
    } else {
      instanceHealthStatus = instanceHealth.UNHEALTHY
    }

    // Set Status
    if (Object.keys(instanceStatuses).length === 1) {
      instanceStatus = this.instanceStatusMap?.[Object.keys(instanceStatuses)[0]] || InstanceServiceStatus.UNKNOWN
    } else if (Object.keys(instanceStatuses).length > 1) {
      instanceStatus = InstanceServiceStatus.MIXED
    } else {
      instanceStatus = InstanceServiceStatus.UNKNOWN
    }

    const healthObj: IHealthObj = {
      replicaStates,
      instanceHealthStatus,
      instanceStatus,
    }

    return healthObj
  }

  async getServiceData() {
    console.log('Getting service data')
    if (!this.instanceClient.serviceId) return
    const dockerClient = await this.getDockerClient()
    return await dockerClient
      .getService(this.instanceClient.serviceId)
      .inspect()
      .catch((err) => {
        console.warn('Error getting service data', err)
        return false
      })
  }
}
