import Dockerode from "dockerode"

export interface IDockerClients {
  [serverId: string]: Dockerode
}
