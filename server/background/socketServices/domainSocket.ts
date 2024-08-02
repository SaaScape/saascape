import constants from '../../helpers/constants'
import { initializeDomainQueueProducer } from '../../queue/producers/domainProducers'
import { DomainSocketEvents } from 'types/sockets'
import ApplicationService from '../../services/applicationService'
import { db } from '../../db'
import { IApplication } from 'types/schemas/Applications'
import { ObjectId } from 'mongodb'
import DomainService from '../../services/domainsService'
import { DomainStatus, IDomain } from 'types/schemas/Domains'

export default class DomainSocket {
  data?: any
  event?: string
  name: string
  constructor(data?: any, event?: string) {
    this.data = data
    this.event = event
    this.name = constants.SOCKET_ROUTES.DOMAIN
  }

  events = {
    [constants.SOCKET_EVENTS.DOMAIN_ADD]: () => this.initializeDomain(),
    [DomainSocketEvents.SYNC_APPLICATION_DIRECTIVES]: () => this.syncApplicationDirectives(),
    [DomainSocketEvents.DELETE_DOMAIN]: () => this.deleteDomain(),
  }

  async initializeDomain() {
    await initializeDomainQueueProducer(this.data)
  }

  async syncApplicationDirectives() {
    const applicationService = new ApplicationService()
    const { applicationId } = this.data
    console.log('syncing application directives', applicationId)
    const application = await db.managementDb
      ?.collection<IApplication>('applications')
      .findOne({ _id: new ObjectId(applicationId) })
    if (!application) throw new Error('Application not found during sync application directives')
    await applicationService.syncApplicationDirectives(application)
  }

  async deleteDomain() {
    const domainId = this.data?._id
    const domain = await db.managementDb
      ?.collection<IDomain>('domains')
      .findOne({ _id: new ObjectId(domainId), status: DomainStatus.DELETED })
    if (!domain) throw { showError: 'Domain not found' }
    const domainService = new DomainService()
    await domainService.domainDeleteCleanUp(domain)
  }
}
