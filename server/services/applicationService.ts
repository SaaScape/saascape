/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import constants from '../helpers/constants'
import { IApplication, ICustomField } from '../schemas/Applications'
import {
  cleanVersionConfig,
  decryptClientTransport,
  encryptData,
  prepareApplicationPayloadForTransport,
} from '../helpers/utils'
import ServerService from './serverService'
import IInstance from 'types/schemas/Instances'
import InstanceService from './instanceService'
import { getDomainApplicationDirectives, updateNginxConfigFile } from '../modules/nginx'
import { ConfigModules } from 'types/enums'

interface IUpdateConfigData {
  configModule: ConfigModules
  fields: any
  [key: string]: any
}

export default class ApplicationService {
  constructor() {}

  async findMany() {
    const applications = await db.managementDb
      ?.collection<IApplication>('applications')
      .find({
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
      .toArray()

    if (!applications) throw { showError: 'Applications not found' }

    for (const application of applications) {
      cleanVersionConfig(application, ['docker_hub_password', 'docker_hub_username'])
      await prepareApplicationPayloadForTransport(application)
    }

    return { applications }
  }
  async findOne(id: string) {
    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: new ObjectId(id) })

    if (!application) throw { showError: 'Application not found' }

    cleanVersionConfig(application, ['docker_hub_password', 'docker_hub_username'])
    await prepareApplicationPayloadForTransport(application)

    return { application }
  }
  async deleteOne(id: string) {
    const application = await db.managementDb
      ?.collection('applications')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: constants.STATUSES.DELETED_STATUS } },
        { returnDocument: 'after' },
      )

    return { application }
  }
  async create(data: any) {
    const foundApplication = await db.managementDb
      ?.collection('applications')
      .findOne({ application_name: data.application_name })
    if (foundApplication) {
      throw { showError: 'Application already exists' }
    }

    const payload: IApplication = {
      application_name: data.application_name,
      status: constants.STATUSES.ACTIVE_STATUS,
      description: data.description,
      linked_ids: [],
      custom_fields: [],
      config: {
        version_config: {},
        secrets_config: {},
        environment_config: {},
        nginx: {},
      },
      created_at: new Date(),
      updated_at: new Date(),
    }

    const application = await db.managementDb?.collection('applications').insertOne(payload)

    return { application }
  }
  async update(id: string, data: any) {
    const foundApplication = await db.managementDb
      ?.collection('applications')
      .findOne({ application_name: data.application_name })
    if (foundApplication) {
      throw { showError: 'Application not found' }
    }

    const payload = {
      application_name: data.application_name,
      description: data.description,
      updated_at: new Date(),
    }

    const application = await db.managementDb
      ?.collection('applications')
      .updateOne({ _id: new ObjectId(id) }, { $set: payload })

    return { application }
  }
  private async updateCustomFields(id: string, data: IUpdateConfigData) {
    const { fields } = data

    if (!Object.keys(fields || {}).length) throw { showError: 'No fields have been changed!' }

    const bulkWrites = []

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
                  $push: {},
                },
              },
            }
            const newFieldData = fields?.[_id]?.[newField]
            const payload: ICustomField = {
              _id: new ObjectId(),
              field: newFieldData?.field,
              type: newFieldData.type,
              label: newFieldData.label,
            }
            if (newFieldData?.type === 'dropdown') {
              payload.options = newFieldData?.options
            }

            insertObj.updateOne.update.$push[`custom_fields`] = payload
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
                $pull: { custom_fields: { _id: { $in: deletedIds } } },
              },
            },
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
              arrayFilters: [{ 'field._id': new ObjectId(_id) }],
            },
          }
          for (const fieldKey in fields[_id]) {
            const updatePath = `custom_fields.$[field].${fieldKey}`

            updateObj.updateOne.update.$set[updatePath] = fields[_id][fieldKey]
          }
          bulkWrites.push(updateObj)
          break
      }
    }

    const res = await db.managementDb?.collection<IApplication>('applications')?.bulkWrite(bulkWrites)

    const latestApplication = await db.managementDb
      ?.collection<IApplication>('applications')
      ?.findOne({ _id: new ObjectId(id) })

    if (!latestApplication) throw { showError: 'Application not found' }

    cleanVersionConfig(latestApplication, ['docker_hub_password', 'docker_hub_username'])

    await prepareApplicationPayloadForTransport(latestApplication)

    return latestApplication
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

            const decipheredValue = isSecret && (await decryptClientTransport(value))
            const payload = {
              _id: newId,
              name: newFieldData?.name,
              value: isSecret ? encryptData(decipheredValue || '') : newFieldData?.value,
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

            const value = fields?.[_id]?.[fieldKey]

            switch (fieldKey) {
              case 'value':
                if (isSecret) {
                  const decipheredValue = await decryptClientTransport(value || '')
                  updateObj.updateOne.update.$set[updatePath] = encryptData(decipheredValue)
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

    await db.managementDb?.collection<IApplication>('applications')?.bulkWrite(bulkWrites)

    const latestApplication = await db.managementDb
      ?.collection<IApplication>('applications')
      ?.findOne({ _id: new ObjectId(id) })

    if (!latestApplication) throw { showError: 'Application not found' }

    cleanVersionConfig(latestApplication, ['docker_hub_password', 'docker_hub_username'])
    await prepareApplicationPayloadForTransport(latestApplication)

    return latestApplication
  }
  private async updateVersionConfig(id: string, data: IUpdateConfigData) {
    const { docker_hub_username, docker_hub_password, docker_hub_webhooks, namespace, repository } = data

    const payload: any = {}

    Object.keys(data).includes('docker_hub_username') &&
      (payload.docker_hub_username = encryptData(docker_hub_username))
    Object.keys(data).includes('docker_hub_password') &&
      (payload.docker_hub_password = encryptData(docker_hub_password))
    Object.keys(data).includes('docker_hub_webhooks') && (payload.docker_hub_webhooks = docker_hub_webhooks)
    Object.keys(data).includes('namespace') && (payload.namespace = namespace)
    Object.keys(data).includes('repository') && (payload.repository = repository)

    const updateObj: any = { updated_at: new Date() }

    for (const key in payload) {
      updateObj[`config.version_config.${key}`] = payload?.[key]
    }

    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      ?.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateObj }, { returnDocument: 'after' })

    if (!application) throw { showError: 'Application not found' }

    cleanVersionConfig(application, ['docker_hub_password', 'docker_hub_username'])
    await prepareApplicationPayloadForTransport(application)

    return application
  }
  async updateConfig(id: string, data: IUpdateConfigData) {
    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      ?.findOne({ _id: new ObjectId(id) })

    if (!application) {
      throw { showError: 'Application not found' }
    }

    const { configModule } = data

    let result: any

    switch (configModule) {
      case ConfigModules.CUSTOM_FIELDS:
        result = await this.updateCustomFields(id, data)
        return { application: result }
      case ConfigModules.ENVIRONMENT_CONFIG:
        result = await this.updateVariables(id, data, constants.CONFIG_MODULES.ENV_VARS)
        return { application: result }
      case ConfigModules.SECRETS_CONFIG:
        result = await this.updateVariables(id, data, constants.CONFIG_MODULES.SECRETS)
        return { application: result }
      case ConfigModules.VERSION_CONFIG:
        result = await this.updateVersionConfig(id, data)
        return { application: result }
      case ConfigModules.NGINX_DIRECTIVE:
        result = await this.updateNginxDirectives(id, data)
        return { application: result }
    }
  }

  async updateNginxDirectives(id: string, data: any) {
    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: new ObjectId(id) })
    if (!application) throw { showError: 'Application not found' }
    const { directive } = data
    application.config.nginx.directives = directive
    const { wasSuccessful } = await this.syncApplicationDirectives(application)
    if (!wasSuccessful) throw { showError: 'Failed to update nginx directives' }
    await db.managementDb?.collection('applications').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'config.nginx.directives': directive,
        },
      },
    )

    return await this.findOne(id)
  }

  async syncApplicationDirectivesCron() {
    const applications = await db.managementDb
      ?.collection<IApplication>('applications')
      .find({
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
      .toArray()

    if (!applications) return

    for (const application of applications) {
      try {
        await this.syncApplicationDirectives(application)
      } catch (err) {
        console.warn(err)
      }
    }
  }
  async syncApplicationDirectives(application: IApplication) {
    const serverService = new ServerService()
    const servers = await db.managementDb
      ?.collection('servers')
      .find({ status: { $nin: [constants.STATUSES.DELETED_STATUS] } })
      .toArray()

    let wasSuccessful = true

    const applicationDirectives = application?.config?.nginx?.directives

    const instanceService = new InstanceService(application?._id)
    const { instances } = await instanceService.findMany()

    for (const server of servers || []) {
      try {
        if (!server?._id || server?.availability === constants.AVAILABILITY.OFFLINE) {
          continue
        }
        const ssh = await serverService.getSSHClient(server?._id.toString())
        //   If this application has nginx directives, then we need to ensure that every connected domain has those directives in place
        for (const instance of instances || []) {
          try {
            await ssh.execCommand(`sudo mkdir -p /etc/nginx/saascape/${instance?.domain?.domain_name}`)
            const location = `/etc/nginx/saascape/${instance?.domain?.domain_name}/application.conf`
            if (applicationDirectives) {
              const newContent = await getDomainApplicationDirectives(instance as IInstance, applicationDirectives)
              await updateNginxConfigFile(ssh, {
                location,
                newContent,
              })
            } else {
              //   Ensure that we remove the application directives from server nginx files
              //   Problem is we also need to remove from host directive so for now we just keep and just remove from host using other cron
            }
          } catch (err) {
            console.warn(err)
            wasSuccessful = false
          }
        }
      } catch (err) {
        console.warn(err)
      }
    }

    return { wasSuccessful }
  }
}
