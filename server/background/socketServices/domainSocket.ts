import constants from "../../helpers/constants"
import { initializeDomainQueueProducer } from "../../queue/producers/domainProducers"

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
  }

  async initializeDomain() {
    await initializeDomainQueueProducer(this.data)
  }
}
