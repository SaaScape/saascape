import { NodeSSH } from "node-ssh"
import {
  checkForMissingParams,
  decipherData,
  encryptData,
  getMissingFields,
} from "../helpers/utils"
import fsp from "fs/promises"
import { IServer } from "../schemas/Servers"
import constants from "../helpers/constants"
import { db } from "../db"

export default class ServerService {
  constructor() {}

  async create(data: any) {
    checkForMissingParams(data, [
      "server_ip_address",
      "ssh_port",
      "admin_username",
      "private_key",
      "server_name",
    ])

    // Check if server already exists
    const server = await db.managementDb
      ?.collection<IServer>("servers")
      .findOne({
        server_ip_address: data.server_ip_address,
        status: { $nin: [constants.STATUSES.DELETED_STATUS] },
      })
    if (server) {
      throw { showError: "Server already exists" }
    }

    const payload: IServer = {
      server_ip_address: data.server_ip_address,
      ssh_port: data.ssh_port,
      admin_username: encryptData(data.admin_username),
      private_key: encryptData(data.private_key),
      server_name: data.server_name,
      server_status: constants.SERVER_STATUSES.PENDING_INITIALIZATION,
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    const result = await db.managementDb
      ?.collection<IServer>("servers")
      .insertOne(payload)

    if (!result?.insertedId) throw { showError: "Server could not be created" }

    return { _id: result.insertedId }
  }

  async testConnection(data: any) {
    const missingParams = getMissingFields(data, [
      "server_ip_address",
      "ssh_port",
      "admin_username",
      "private_key",
    ])

    if (missingParams.length > 0) {
      return {
        success: false,
        data: { error: "Missing required params", missingParams },
      }
    }
    const key = await fsp.readFile("/Users/keir/google", "utf8")

    const ssh = new NodeSSH()

    await ssh
      .connect({
        host: data.server_ip_address,
        port: data.ssh_port,
        username: data.admin_username,
        privateKey: data.private_key,
      })
      .catch((e) => {
        console.log(e)
        throw { showError: e.message }
      })

    try {
      await ssh.execCommand("sudo ls /")
    } catch (err: any) {
      throw { showError: err?.stderr }
    }

    return { success: true }
  }
  async update(id: string, data: any) {}
  async delete(id: string) {}
  async findMany(query: any) {}
}
