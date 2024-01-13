import { Document } from "mongodb"
import { IEncryptedData } from "../interfaces/interfaces"

export interface IServer extends Document {
  server_ip_address: string
  ssh_port: number
  admin_username: IEncryptedData
  private_key: IEncryptedData
  server_name: string
  status: string
  server_status: string
}
