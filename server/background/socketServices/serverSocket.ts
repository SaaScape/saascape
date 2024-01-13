import constants from "../../helpers/constants"

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
    [constants.SOCKET_EVENTS.SERVER_CREATE]: () => this.serverCreate(),
  }

  async serverCreate() {
    console.log("server create", this.data)
  }
}
