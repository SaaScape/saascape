import Dockerode from "dockerode"
import SSHService from "../services/sshService"

export interface IDockerClients {
  [serverId: string]: Dockerode
}

export interface ISSHClients {
  [serverId: string]: SSHService
}
