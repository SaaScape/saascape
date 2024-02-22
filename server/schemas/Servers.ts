import { Document, ObjectId } from "mongodb"
import {
  IEncryptedData,
  ILinkedIdEnabledDocument,
} from "../interfaces/interfaces"
import { NodeType } from "./Integrations"

export interface IServer extends Document, ILinkedIdEnabledDocument {
  temp_config?: {
    swarm_id?: ObjectId
    node_type: NodeType
    create_swarm: boolean
  }
  server_ip_address: string
  ssh_port: number
  admin_username: IEncryptedData
  private_key: IEncryptedData
  server_name: string
  status: string
  server_status: string
  availability: string
  availability_changed: Date
  docker_data?: {
    certs?: {
      ca: IEncryptedData
      server: {
        cert: IEncryptedData
        key: IEncryptedData
      }
      client: {
        cert: IEncryptedData
        key: IEncryptedData
      }
    }
    availability: {
      status: string
      updated_at: Date
      message: string
    }
  }
  system_info?: {
    os: string
    cpu_model: string
    cpu_core_count: number
    architecture: string
    storage: {
      totalStorage: number // in bytes
      disks: {
        [diskName: string]: {
          children: {
            name: string
            mountpoints: string[]
            rm: boolean
            ro: boolean
            size: number //in bytes
          }[]
          mountpoints: string[]
          rm: boolean
          ro: boolean
          size: number //in bytes
        }
      }
    }
  }
  created_at: Date
  updated_at: Date
}

export interface IServerDeciphered extends IServer {
  decipheredData: {
    admin_username: string
    private_key: string
  }
}
