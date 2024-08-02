/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import constants from '../helpers/constants'
import Pagination from '../helpers/pagination'
import { DomainStatus, IDomain } from 'types/schemas/Domains'
import ServerService from './serverService'
import { IServer } from '../schemas/Servers'
import { deleteNginxConfigFile, getDomainConfigFile } from '../modules/nginx'
import { logError } from '../helpers/error'
import queues from '../helpers/queues'
import SSL from '../modules/ssl'
import dns from 'node:dns'
import IInstance, { instanceDbStatus } from 'types/schemas/Instances'
import { IApplication } from 'types/schemas/Applications'
import { SSLStatus } from 'types/enums'
import { decipherData } from '../helpers/utils'
import { io } from '../init/sockets'
import { DomainSocketEvents } from 'types/sockets'

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
        .find({ status: instanceDbStatus.ACTIVE })
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
    // TODO: Remove ssl key before sending to client
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
      status: DomainStatus.ACTIVE,
      description: data.description,
      enable_ssl: data?.enable_ssl,
      SSL: {
        status: SSLStatus.PENDING_INITIALIZATION,
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
      .find({ status: DomainStatus.ACTIVE })
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

  // TODO: Do not allow deletion of domain, if linked to an instance

  async getSSLCerts(domainId: ObjectId): Promise<false | DecipheredCertificates> {
    // Do not expose to front end
    const domain = await db.managementDb?.collection<IDomain>('domains').findOne({ _id: domainId })
    if (!domain) throw new Error('Domain not found')
    if (!domain.enable_ssl) return false

    const { certificates, status } = domain?.SSL || {}

    if (!status || !constants.ACTIVE_SSL_STATUSES.includes(status))
      throw new Error('Domain SSL is not ready to be applied')
    if (!certificates) throw new Error('No SSL certificates found')

    return {
      cert: certificates.cert && decipherData(certificates.cert.encryptedData, certificates.cert.iv),
      key: certificates.key && decipherData(certificates.key.encryptedData, certificates.key.iv),
      csr: certificates.csr && decipherData(certificates.csr.encryptedData, certificates.csr.iv),
    }
  }

  async deleteDomain(id: string) {
    const domain = await db.managementDb?.collection('domains').findOne({ _id: new ObjectId(id) })
    if (!domain) throw { showError: 'Domain not found' }
    //   Check if domain is linked to an instance
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      .findOne({ domain_id: domain?._id, status: { $ne: instanceDbStatus.DELETED } })
    if (instance) throw { showError: `Cannot delete this domain as it is linked to the instance ${instance?.name}` }

    const deleteResult = await db.managementDb
      ?.collection<IDomain>('domains')
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: DomainStatus.DELETED } })

    if (!deleteResult?.modifiedCount) throw { showError: 'Failed to delete domain' }

    io.io?.to(constants.SOCKET_ROOMS.BACKGROUND_SERVERS).emit(DomainSocketEvents.DELETE_DOMAIN, { _id: id })
  }

  private async removeDomainFromNginx(domain: IDomain) {
    const serverService = new ServerService()
    const servers = await db.managementDb
      ?.collection<IServer>('servers')
      .find({ status: constants.STATUSES.ACTIVE_STATUS, availability: constants.AVAILABILITY.ONLINE })
      .toArray()

    for (const server of servers || []) {
      try {
        if (server?.availability === constants.AVAILABILITY.OFFLINE) continue
        console.log('removing domain from server', server?._id.toString())
        const ssh = await serverService.getSSHClient(server?._id.toString())
        const locations = {
          mainConfig: `/etc/nginx/sites-enabled/${domain?.domain_name}`,
          appConfig: `/etc/nginx/saascape/${domain?.domain_name}/application.conf`,
          sslCert: `/saascape/certificates/domains/${domain?.domain_name}.crt`,
          sslKey: `/saascape/certificates/domains/${domain?.domain_name}.key`,
          indexHtml: `/var/www/${domain?.domain_name}/index.html`,
        }
        await deleteNginxConfigFile(ssh, locations.mainConfig, true)
        await deleteNginxConfigFile(ssh, locations.appConfig, true)
        await deleteNginxConfigFile(ssh, locations.sslCert, true)
        await deleteNginxConfigFile(ssh, locations.sslKey, true)
        await deleteNginxConfigFile(ssh, locations.indexHtml, true)
      } catch (err) {
        console.log(err)
      }
    }
  }

  async domainDeleteCleanUp(domain: IDomain) {
    //   Check if domain is linked to an instance
    const instance = await db.managementDb
      ?.collection<IInstance>('instances')
      .findOne({ domain_id: domain?._id, status: { $ne: instanceDbStatus.DELETED } })
    if (instance) throw { showError: `Cannot delete this domain as it is linked to the instance ${instance?.name}` }
    const ssl = new SSL(domain?._id, domain)
    //   First we need to revoke SSL certificates and disable enable ssl
    await ssl.revokeCertificate()
    // Then we need to remove domain config from NGINX
    await this.removeDomainFromNginx(domain)
    console.log('finished deleting domain', domain.domain_name)
  }
}

export type DecipheredCertificates = { cert: string; key: string; csr: string }
