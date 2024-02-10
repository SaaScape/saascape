import { Document } from "mongodb"
import {
  IEncryptedData,
  ILinkedIdEnabledDocument,
} from "../interfaces/interfaces"

export interface IServer extends Document, ILinkedIdEnabledDocument {
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
  created_at: Date
  updated_at: Date
}

export interface IServerDeciphered extends IServer {
  decipheredData: {
    admin_username: string
    private_key: string
  }
}
