/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import IInstance, { instanceDbStatus, InstanceServiceStatus } from 'types/schemas/Instances'
import { ConfigModules, instanceHealth, updateStatus, UpdateType } from 'types/enums'
import constants from '../helpers/constants'
import { IApplication } from '../schemas/Applications'
import { encryptData, prepareApplicationPayloadForTransport } from '../helpers/utils'

interface IUpdateConfigData {
  configModule: ConfigModules
  fields: any
  tags?: IInstance['tags']
  updateType?: UpdateType
  [key: string]: any
}

interface IScaleInstanceData {
  replicas: number
}

export default class InstanceService {
  applicationId: ObjectId
  constructor(applicationId: ObjectId) {
    this.applicationId = applicationId
  }

  async setInstanceUpdateStatus(instanceId: string, status: updateStatus, additionalData?: { [key: string]: any }) {
    await db.managementDb
      ?.collection<IInstance>('instances')
      .updateOne(
        { _id: new ObjectId(instanceId) },
        { $set: { ...(additionalData || {}), update_status: status, update_status_updated_at: new Date() } },
      )
  }

  async getInstancesStats() {
    const instanceData = await db.managementDb
      ?.collection<IInstance>('instances')
      .aggregate([
        {
          $match: {
            application_id: this.applicationId,
            status: instanceDbStatus.ACTIVE,
          },
        },
        { $group: { _id: '$service_status', count: { $count: {} } } },
      ])
      .toArray()

    const responseObj: { [key: string]: any; totalInstances: number } = {
      totalInstances: 0,
    }

    for (const obj of instanceData || []) {
      const { _id: serviceStatus, count } = obj
      responseObj[serviceStatus] = count
      responseObj.totalInstances += count
    }

    return { instancesData: responseObj }
  }

  async findMany() {
    const instances = await db.managementDb
      ?.collection<IInstance>('instances')
      .aggregate([
        {
          $match: {
            application_id: this.applicationId,
            status: { $nin: [instanceDbStatus.DELETED] },
          },
        },
        {
          $lookup: {
            from: 'versions',
            localField: 'version_id',
            foreignField: '_id',
            as: 'version',
          },
        },
        {
          $lookup: {
            from: 'domains',
            localField: 'domain_id',
            foreignField: '_id',
            as: 'domain',
          },
        },
        {
          $set: {
            version: { $first: '$version' },
            domain: { $first: '$domain' },
          },
        },
      ])
      .toArray()

    // TODO: Apply instance secrets config transport encryption here

    return {
      instances,
    }
  }

  async findOne(instanceId: ObjectId) {
    const instance = (
      await db.managementDb
        ?.collection<IInstance>('instances')
        .aggregate([
          {
            $match: {
              _id: instanceId,
              application_id: this.applicationId,
              status: { $nin: [instanceDbStatus.DELETED] },
            },
          },
          { $limit: 1 },
          {
            $lookup: {
              from: 'versions',
              localField: 'version_id',
              foreignField: '_id',
              as: 'version',
            },
          },
          {
            $lookup: {
              from: 'domains',
              localField: 'domain_id',
              foreignField: '_id',
              as: 'domain',
            },
          },
          {
            $set: {
              version: { $first: '$version' },
              domain: { $first: '$domain' },
            },
          },
        ])
        .toArray()
    )?.[0] as IInstance

    if (!instance) throw { showError: 'Instance not found' }
    // Do client transport encryption for instance config

    await prepareApplicationPayloadForTransport(instance)

    return {
      instance,
    }
  }

  async create(data: any) {
    const { version_id, swarm_id, name, is_custom_database, database, domain_id, run_command, volumes } = data

    if (!version_id || !swarm_id || !name || !database) throw { showError: 'Missing required fields' }

    // Check if instance already exists with the same name
    const foundInstance = await db.managementDb
      ?.collection<IInstance>('instances')
      .countDocuments({ name, status: { $nin: [instanceDbStatus.DELETED] } })

    if (!!foundInstance) {
      throw { showError: 'Instance already exists' }
    }

    const domainInUse = domain_id && (await this.checkDomainInUse(new ObjectId(domain_id)))
    if (domainInUse) throw { showError: `Domain is already in use by ${domainInUse.name}` }

    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: new ObjectId(this.applicationId) })
    if (!application) throw { showError: 'Application not found' }

    const payload: IInstance = {
      _id: new ObjectId(),
      name,
      service_status: InstanceServiceStatus.PRE_CONFIGURED,
      service_health: instanceHealth.UNKNOWN,
      service_health_updated_at: new Date(),
      update_status: updateStatus.READY,
      config: {
        environment_config: application?.config?.environment_config,
        secrets_config: application?.config?.secrets_config,
        run_command: run_command && run_command?.split(',').map((cmd: string) => cmd.trim()),
        volumes: volumes && volumes?.split(',').map((volume: string) => volume.trim()),
      },
      port_assignment: 'auto',
      is_custom_database,
      database: is_custom_database ? database : new ObjectId(database),
      version_id: new ObjectId(version_id),
      application_id: this.applicationId,
      status: instanceDbStatus.ACTIVE,
      swarm_id: new ObjectId(swarm_id),
      port: 0,
      replicas: 0,
      linked_ids: [], // This will be an array of docker services etc
      tags: ['New Instance'],
      deployed_at: null,
      domain_id: domain_id && new ObjectId(domain_id),
      created_at: new Date(),
      updated_at: new Date(),
    }

    const instance = await db.managementDb?.collection<IInstance>('instances').findOneAndReplace(
      {
        _id: payload._id,
        application_id: this.applicationId,
        status: instanceDbStatus.ACTIVE,
      },
      payload,
      {
        upsert: true,
        returnDocument: 'after',
      },
    )

    if (!instance) throw { showError: 'Instance not created' }

    return {
      instance,
    }
  }

  async deleteOne(instanceId: ObjectId) {
    // Do some logic here with regards to deleting the instance, such as removing service etc
    await db.managementDb?.collection<IInstance>('instances').updateOne(
      {
        _id: instanceId,
      },
      { $set: { status: instanceDbStatus.PENDING_REMOVAL } },
    )
  }

  private async updateVariables(id: string, data: IUpdateConfigData, type: string) {
    const { fields } = data

    if (!Object.keys(fields || {}).length) throw { showError: 'No fields have been changed!' }

    const bulkWrites = [
      {
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: { $set: { updated_at: new Date() } },
        },
      },
    ]

    const isSecret = type === constants.CONFIG_MODULES.SECRETS

    for (const _id in fields) {
      switch (_id) {
        case 'newFields':
          for (const newField in fields[_id]) {
            const insertObj: any = {
              updateOne: {
                filter: {
                  _id: new ObjectId(id),
                },
                update: {
                  $set: {},
                },
              },
            }
            const newFieldData = fields?.[_id]?.[newField]
            const newId = new ObjectId()

            const value = fields?.[_id]?.[newField]?.value
            if (!value) continue

            // const decipheredValue = isSecret && (await decryptClientTransport(value))
            const payload = {
              _id: newId,
              name: newFieldData?.name,
              value: isSecret ? encryptData(newFieldData.value || '') : newFieldData?.value,
            }
            insertObj.updateOne.update.$set[`config.${type}.${newId.toString()}`] = payload
            bulkWrites.push(insertObj)
          }
          break
        case 'deleted':
          const deletedIds = Object.keys(fields[_id])?.map((id) => new ObjectId(id))
          const deleteObj: any = {
            updateOne: {
              filter: {
                _id: new ObjectId(id),
              },
              update: {
                $unset: {},
              },
            },
          }
          for (const _id of deletedIds) {
            deleteObj.updateOne.update.$unset[`config.${type}.${_id.toString()}`] = true
          }
          bulkWrites.push(deleteObj)
          break
        default:
          const updateObj: any = {
            updateOne: {
              filter: {
                _id: new ObjectId(id),
              },
              update: {
                $set: {},
              },
            },
          }

          for (const fieldKey in fields[_id]) {
            const updatePath = `config.${type}.${_id.toString()}.${fieldKey}`
            const dockerSecretPath = `config.${type}.${_id.toString()}.docker_secret_id`

            const value = fields?.[_id]?.[fieldKey]

            switch (fieldKey) {
              case 'value':
                if (isSecret) {
                  // const decipheredValue = await decryptClientTransport(value || '')
                  updateObj.updateOne.update.$set[updatePath] = encryptData(value)
                  updateObj.updateOne.update.$set[dockerSecretPath] = null
                  break
                }

              default:
                updateObj.updateOne.update.$set[updatePath] = value
            }
          }
          bulkWrites.push(updateObj)
          break
      }
    }

    await db.managementDb?.collection<IInstance>('instances')?.bulkWrite(bulkWrites)

    const latestInstance = await db.managementDb?.collection<IInstance>('instances')?.findOne({ _id: new ObjectId(id) })

    if (!latestInstance) throw { showError: 'Instance not found' }

    await prepareApplicationPayloadForTransport(latestInstance)

    return latestInstance
  }

  private async updateTags(id: string, data: IUpdateConfigData) {
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({
      _id: new ObjectId(id),
      application_id: new ObjectId(this.applicationId),
    })
    if (!instance) throw { showError: 'Instance not found' }

    const { updateType } = data

    switch (updateType) {
      case UpdateType.ADD:
        await db.managementDb?.collection<IInstance>('instances').updateOne(
          {
            _id: new ObjectId(id),
            application_id: new ObjectId(this.applicationId),
          },
          { $addToSet: { tags: { $each: data.tags } } },
        )
        return await this.findOne(new ObjectId(id))
      case UpdateType.REMOVE:
        await db.managementDb?.collection<IInstance>('instances').updateOne(
          {
            _id: new ObjectId(id),
            application_id: new ObjectId(this.applicationId),
          },
          { $pull: { tags: { $in: data.tags } } },
        )
        return await this.findOne(new ObjectId(id))
      default:
        throw { showError: 'Tag update type not found' }
    }
  }

  private async updateInstanceVersion(id: string, data: IUpdateConfigData) {
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({
      _id: new ObjectId(id),
      application_id: new ObjectId(this.applicationId),
    })

    if (!instance) throw { showError: 'Instance not found' }

    const { version_id, updateService } = data
    const version = await db.managementDb?.collection('versions').findOne({ _id: new ObjectId(version_id) })

    if (!version) throw { showError: 'Version not found' }

    // Update the instance with the new version in DB
    await db.managementDb?.collection<IInstance>('instances').updateOne(
      {
        _id: new ObjectId(id),
        application_id: new ObjectId(this.applicationId),
      },
      { $set: { version_id: version?._id } },
    )

    // Do we intend to update the service as well?
    if (updateService) {
      // Do some logic here to update the service
    }

    return await this.findOne(new ObjectId(id))
  }

  async updateConfig(id: string, data: IUpdateConfigData) {
    const instance = await db.managementDb?.collection<IInstance>('instances')?.findOne({ _id: new ObjectId(id) })

    if (!instance) throw { showError: 'Instance not found' }

    const { configModule } = data

    switch (configModule) {
      case ConfigModules.ENVIRONMENT_CONFIG:
        return this.updateVariables(id, data, constants.CONFIG_MODULES.ENV_VARS)
      case ConfigModules.SECRETS_CONFIG:
        return this.updateVariables(id, data, constants.CONFIG_MODULES.SECRETS)
      case ConfigModules.TAGS:
        return this.updateTags(id, data)
      case ConfigModules.INSTANCE_VERSION:
        return this.updateInstanceVersion(id, data)
      default:
        throw { showError: 'Config module not found' }
    }
  }

  async checkDomainInUse(domainId: ObjectId, instanceId?: ObjectId) {
    return db.managementDb
      ?.collection<IInstance>('instances')
      .findOne(
        { status: { $nin: [instanceDbStatus.DELETED] }, domain_id: domainId, _id: { $ne: instanceId } },
        { projection: { name: 1 } },
      )
  }

  async updateOne(id: string, data: any) {
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      ?.findOne({ _id: new ObjectId(id), application_id: this.applicationId })
    if (!instance) throw { showError: 'Instance not found' }

    const { swarm_id, name, database, replicas, isCustomDatabase, port, domain_id, run_command, volumes } = data

    if (!swarm_id || !name || !database || !(replicas >= 0)) throw { showError: 'Missing required fields' }

    // Check if domain is in use by other instance
    const domainInUse = domain_id && (await this.checkDomainInUse(new ObjectId(id), new ObjectId(domain_id)))
    if (domainInUse) throw { showError: `Domain is already in use by ${domainInUse.name}` }
    const payload: any = {
      name,
      is_custom_database: isCustomDatabase,
      database: isCustomDatabase ? database : new ObjectId(database),
      'config.run_command': run_command && run_command?.split(',').map((cmd: string) => cmd.trim()),
      'config.volumes': volumes && volumes?.split(',').map((volume: string) => volume.trim()),
      port,
      replicas,
      swarm_id: new ObjectId(swarm_id),
      domain_id: domain_id && new ObjectId(domain_id),
      updated_at: new Date(),
    }

    await db.managementDb?.collection<IInstance>('instances').updateOne({ _id: new ObjectId(id) }, { $set: payload })

    return await this.findOne(new ObjectId(id))
  }

  async requestDeployment(id: string) {
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      ?.findOne({ _id: new ObjectId(id), application_id: this.applicationId })
    if (!instance) throw { showError: 'Instance not found' }

    // Check instance has all required fields to deploy
    const { name, database, port, replicas, swarm_id, domain_id, version_id, update_status } = instance

    // Check update status
    if (update_status !== updateStatus.READY) throw { showError: 'Instance is not ready to be updated' }

    if (!name || !database || !(replicas > 0) || !swarm_id || !version_id)
      throw { showError: 'Missing required fields' }

    const payload: { status: instanceDbStatus; service_status?: InstanceServiceStatus } = {
      status: instanceDbStatus.PENDING_DEPLOYMENT,
    }

    if (instance.service_status === InstanceServiceStatus.PRE_CONFIGURED) {
      payload.service_status = InstanceServiceStatus.PENDING
    }

    await db.managementDb?.collection<IInstance>('instances').updateOne({ _id: new ObjectId(id) }, { $set: payload })
    // TODO: When pending deployment, do not allow any updates to the instance or additional deployments

    return await this.findOne(new ObjectId(id))
  }

  async scaleInstance(id: string, data: IScaleInstanceData) {
    const { replicas } = data

    const instance = await db.managementDb?.collection<IInstance>('instances')?.findOne({
      _id: new ObjectId(id),
      application_id: this.applicationId,
      status: { $in: [instanceDbStatus.ACTIVE] },
    })

    if (!instance) throw { showError: 'Instance not found' }

    const { update_status } = instance

    // Check update status
    if (update_status !== updateStatus.READY) throw { showError: 'Instance is not ready to be updated' }

    await this.setInstanceUpdateStatus(id, updateStatus.UPDATING, { replicas })

    return await this.findOne(new ObjectId(id))
  }
}
