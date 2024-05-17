/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import constants from '../helpers/constants'
import Pagination from '../helpers/pagination'
import { DomainSSLStatus, IDomain } from '../schemas/Domains'
import ServerService from './serverService'
import { IServer } from '../schemas/Servers'
import { getDomainConfigFile } from '../modules/nginx'
import { logError } from '../helpers/error'
import queues from '../helpers/queues'
import SSL from '../modules/ssl'
import dns from 'node:dns'
import IInstance from 'types/schemas/Instances'
import { IApplication } from '../schemas/Applications'
import { has } from 'lodash'

export default class DomainService {
  async findMany(query: any) {
    const pagination = new Pagination(query)
    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    const { availableOnly, includeDomain } = query

    if (availableOnly) {
      const domainsToIgnore = new Set()
      const instances = await db?.managementDb
        ?.collection<IInstance>('instances')
        .find({ status: constants.STATUSES.ACTIVE_STATUS })
        .project({ domain_id: 1 })
        .toArray()
      for (const instance of instances || []) {
        if (includeDomain?.toString() === instance?.domain_id?.toString()) continue
        domainsToIgnore.add(instance?.domain_id)
      }

      findObj._id = {
        $nin: Array.from(domainsToIgnore),
      }
    }

    if (query?.searchValue) {
      findObj['$or'] = [{ domain_name: { $regex: query.searchValue, $options: 'i' } }]
    }

    const domains = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection('domains'),
      findObj,
    })

    return { data: domains }
  }

  async findOne(id: string) {
    const domain = await db.managementDb?.collection('domains').findOne({ _id: new ObjectId(id) })
    if (!domain) throw { showError: 'Domain not found' }
    return { domain }
  }

  async addDomain(data: any) {
    const { domain_name } = data
    if (!domain_name) throw { showError: 'Domain name is required' }
    const domainNameRegex = new RegExp(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/)

    if (!domainNameRegex.test(domain_name)) {
      throw { showError: 'Invalid domain name' }
    }

    const foundDomain = await db.managementDb?.collection('domains').findOne({
      domain_name: data.domain_name,
    })
    if (foundDomain) {
      throw { showError: 'Domain already exists' }
    }

    const payload: IDomain = {
      domain_name: data.domain_name,
      status: constants.STATUSES.ACTIVE_STATUS,
      description: data.description,
      enable_ssl: data?.enable_ssl,
      SSL: {
        status: constants.SSL_STATUSES.PENDING_INITIALIZATION as DomainSSLStatus,
      },
      DNS: {
        a_record: '',
        last_updated: new Date(),
      },
      linked_servers: [],
      created_at: new Date(),
      updated_at: new Date(),
    }
    const domain = await db.managementDb?.collection('domains').insertOne(payload)

    return { domain }
  }

  async updateDomain(id: string, data: any) {
    const foundDomain = await db.managementDb?.collection('domains').findOne({
      domain_name: data.domain_name,
      status: constants.STATUSES.ACTIVE_STATUS,
    })

    if (foundDomain && foundDomain?._id.toString() !== id) {
      throw { showError: 'Domain already exists' }
    }

    const payload = {
      description: data.description,
      updated_at: new Date(),
      enable_ssl: data?.enable_ssl,
    }
    const domain = await db.managementDb?.collection('domains').updateOne({ _id: new ObjectId(id) }, { $set: payload })
    return { domain }
  }

  async beginInitialization(id: string) {
    console.log('begin initialization', id)

    const domain = await db.managementDb?.collection<IDomain>('domains').findOne({ _id: new ObjectId(id) })

    if (!domain) throw new Error('Domain not found')

    // We should prepare the domain to be initialized on each server

    const servers = await db.managementDb
      ?.collection<IServer>('servers')
      .find({ status: constants.STATUSES.ACTIVE_STATUS })
      .toArray()

    await this.addDomainToServer(servers || [], domain)
  }

  async addDomainToServer(servers: IServer[], domain: IDomain) {
    const serverService = new ServerService()

    const newLinkedServers: IDomain['linked_servers'] = []

    // Check if domain is mapped to an instance
    const instance = await db.managementDb?.collection<IInstance>('instances').findOne({ domain_id: domain?._id })
    const application =
      instance?.application_id &&
      (await db.managementDb?.collection<IApplication>('applications').findOne({ _id: instance?.application_id }))

    const hasApplicationDirectives = application?.config?.nginx?.directives

    for (const server of servers || []) {
      try {
        if (!server?._id || server?.availability === constants.AVAILABILITY.OFFLINE) {
          continue
        }

        const ssh = await serverService.getSSHClient(server?._id.toString())

        const { SSL } = domain

        let isSSLDomain = !!domain?.enable_ssl && !!SSL?.certificates?.cert && !!SSL?.certificates?.key

        const certFileExistence = {
          cert: await ssh.checkIfFileExists(`/saascape/certificates/domains/${domain?.domain_name}.crt`),
          key: await ssh.checkIfFileExists(`/saascape/certificates/domains/${domain?.domain_name}.key`),
        }

        isSSLDomain = isSSLDomain && certFileExistence.cert && certFileExistence.key
        const applicationDirectivesExist =
          hasApplicationDirectives &&
          (await ssh
            .checkIfFileExists(`/etc/nginx/saascape/${domain?.domain_name}/application.conf`)
            .catch(() => false))

        const configFiles = {
          secure: await getDomainConfigFile(domain, true, !!applicationDirectivesExist),
          insecure: await getDomainConfigFile(domain, false, !!applicationDirectivesExist),
        }

        await serverService
          .addDomain(server?._id.toString(), {
            domain,
            html: this.#generateBaseIndexHTMLFile(domain),
            configFile: configFiles?.[isSSLDomain ? 'secure' : 'insecure'],
          })
          .catch(async (err) => {
            if (isSSLDomain) {
              // Attempt to apply insecure nginx config
              await serverService.addDomain(server?._id.toString(), {
                domain,
                html: this.#generateBaseIndexHTMLFile(domain),
                configFile: configFiles?.insecure,
              })
              await logError({
                error: JSON.stringify({
                  message: `Failed to update NGINX config on server: ${server?._id}`,
                  reason: (err as any)?.message,
                }),
                entityId: domain?._id,
                status: 'Applied http config on https enabled domain',
                module: constants.MODULES.DOMAIN,
                event: queues.DOMAIN.INITIALIZE_DOMAIN,
              })
            } else {
              throw err
            }
          })

        newLinkedServers.push({
          server_id: server?._id,
          status: constants.STATUSES.ACTIVE_STATUS,
          last_sync: new Date(),
        })
      } catch (err) {
        const errorObj = {
          message: 'Failed to initialize domain on server: ' + server?._id,
          reason: (err as any)?.message,
        }
        await logError({
          error: JSON.stringify(errorObj),
          entityId: domain?._id,
          status: constants.STATUSES.FAILED_STATUS,
          module: constants.MODULES.DOMAIN,
          event: queues.DOMAIN.INITIALIZE_DOMAIN,
        })
      }
    }

    await db.managementDb?.collection<IDomain>('domains').updateOne(
      { _id: new ObjectId(domain?._id) },
      {
        $pull: {
          linked_servers: {
            server_id: {
              $in: newLinkedServers.map((server) => server?.server_id),
            },
          },
        },
      },
    )

    await db.managementDb?.collection<IDomain>('domains').updateOne(
      { _id: new ObjectId(domain?._id) },
      {
        $push: {
          linked_servers: {
            $each: newLinkedServers,
          },
        },
      },
    )
  }

  #generateBaseIndexHTMLFile(domain: IDomain) {
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${domain?.domain_name}</title>
    </head>
    <body>
        <h1>${domain?.domain_name}</h1>
    </body>
    </html>`

    return html
  }

  async initializeSSL(_id: string) {
    const ssl = new SSL(_id)
    await ssl.initializeSSL()
  }

  async applySSLCer(domainId: ObjectId) {
    const domain = await db.managementDb?.collection<IDomain>('domains').findOne({ _id: domainId })
    if (!domain) throw new Error('Domain not found')

    const { certificates, status } = domain?.SSL || {}
    if (
      ![constants.SSL_STATUSES.ACTIVE, constants.SSL_STATUSES.EXPIRING, constants.SSL_STATUSES.EXPIRED].includes(
        status || '',
      )
    )
      throw new Error('Domain SSL is not ready to be applied')
    if (!certificates) throw new Error('No SSL certificates found')

    const serverService = new ServerService()
    const { servers } = await serverService.addDomainSSL(domain)

    await this.addDomainToServer(servers, domain)
  }

  async checkDnsData(domainName: string) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    const results = await new Promise<String[]>((resolve, reject) => {
      dns.resolve(domainName, 'A', (err, addresses) => {
        if (err) {
          reject(err)
        } else {
          resolve(addresses)
        }
      })
    })
    return results
  }

  async cronCheckDnsData() {
    const domains = await db.managementDb
      ?.collection<IDomain>('domains')
      .find({ status: constants.STATUSES.ACTIVE_STATUS })
      .toArray()

    if (!domains?.length) return

    const bulkUpdates = []

    for (const domain of domains) {
      const result = await this.checkDnsData(domain?.domain_name).catch((err) => {
        return
      })
      if (!result) continue

      bulkUpdates.push({
        updateOne: {
          filter: { _id: new ObjectId(domain?._id) },
          update: {
            $set: {
              'DNS.a_record': result?.[0],
              'DNS.last_updated': new Date(),
            },
          },
        },
      })
    }

    await db?.managementDb?.collection<IDomain>('domains').bulkWrite(bulkUpdates)
  }
}
