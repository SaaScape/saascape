import { NodeSSH } from "node-ssh"

interface ISSH {
  host: string
  port: number
  username: string
  privateKey: string
}

export default class SSHService {
  client: NodeSSH
  data: ISSH
  constructor(data: ISSH) {
    this.client = new NodeSSH()
    this.data = data
  }

  async connect() {
    await this.client.connect(this.data).catch((error) => {
      console.log(error)
      throw { showError: error.message }
    })
  }

  async testAdmin() {
    const result = await this.client.execCommand("sudo ls /").catch((error) => {
      console.log(error)
      throw { showError: error?.stderr }
    })
    return result
  }

  async getOsInfo() {
    const osInfo = await this.client
      .execCommand("hostnamectl --json=pretty")
      .catch((error) => {
        console.log(error)
        throw { showError: error?.stderr }
      })

    const obj = JSON.parse(osInfo.stdout)
    return obj
  }

  async execCommand(command: string) {
    const connected = this.client.isConnected()
    if (!connected) {
      await this.connect()
    }
    const sshResult = await this.client.execCommand(command)
    if (sshResult.code !== 0) {
      throw new Error(sshResult.stderr || sshResult.stdout)
    }
    return sshResult
  }

  async checkIfFileExists(file: string) {
    const result = await this.execCommand(
      `if sudo test -f "${file}"; then echo true; else echo false; fi`
    )
    if (result.code !== 0) throw new Error(result.stderr)
    const exists = !!(result.stdout === "true")
    return exists
  }
}
