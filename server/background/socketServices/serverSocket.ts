import constants from "../../helpers/constants"
import { initializeServerQueueProducer } from "../../queue/producers/serverProducers"

export default class ServerSocket {
  data?: any
  event?: string
  name: string
  constructor(data?: any, event?: string) {
    this.data = data
    this.event = event
    this.name = constants.SOCKET_ROUTES.SERVER
  }

  events = {
    [constants.SOCKET_EVENTS.SERVER_INITIALIZE]: () => this.initializeServer(),
  }

  async initializeServer() {
    await initializeServerQueueProducer(this.data)
  }
}
