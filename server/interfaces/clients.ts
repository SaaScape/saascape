/*
 * Copyright SaaScape (c) 2024.
 */

import Dockerode from 'dockerode'
import SSHService from '../services/sshService'
import Instance from '../modules/instance'

export interface IDockerClients {
  [serverId: string]: Dockerode
}

export interface ISSHClients {
  [serverId: string]: SSHService
}

export interface IInstanceClients {
  [instanceId: string]: Instance
}
