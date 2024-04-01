import fsp from "fs/promises"
import path from "path"
import { IDomain } from "../schemas/Domains"
import SSHService from "../services/sshService"
export const getDomainConfigFile = async (
  domain: IDomain,
  isSSLDomain: boolean
) => {
  const configFileName = isSSLDomain
    ? "nginxDomainBaseConfigSSL.conf"
    : "nginxDomainBaseConfig.conf"

  let baseDomainConfig = await fsp.readFile(
    path.join(__dirname, "../", "configs", configFileName),
    { encoding: "utf-8" }
  )
  const { HOST_DOMAIN } = process.env

  baseDomainConfig = baseDomainConfig.replaceAll(
    /<DOMAIN>/gi,
    domain.domain_name
  )
  baseDomainConfig = baseDomainConfig.replaceAll(
    /<HOST_DOMAIN>/gi,
    HOST_DOMAIN || "localhost"
  )

  baseDomainConfig = baseDomainConfig.replaceAll(
    /<SSL_CERTIFICATE>/gi,
    `${domain.domain_name}.crt`
  )
  baseDomainConfig = baseDomainConfig.replaceAll(
    /<SSL_CERTIFICATE_KEY>/gi,
    `${domain.domain_name}.key`
  )

  baseDomainConfig = baseDomainConfig.replaceAll(/\$/gi, "\\$")

  return baseDomainConfig
}

interface IUpdateNginxConfigFileConfig {
  location: string
  newContent: string
}

export const checkNginxStatus = async (ssh: SSHService) => {
  const nginxStatus = await ssh.execCommand("sudo nginx -t")
  if (nginxStatus.code !== 0) {
    throw new Error(
      `Nginx config check failed: ${nginxStatus.stdout},,, ${nginxStatus.stderr}`
    )
  }

  return nginxStatus
}

export const updateNginxConfigFile = async (
  ssh: SSHService,
  config: IUpdateNginxConfigFileConfig
) => {
  const { location, newContent } = config

  const exists = await ssh.checkIfFileExists(location)

  // Get existing content
  const { stdout } = exists
    ? await ssh.execCommand(`sudo cat ${location}`)
    : {
        stdout: undefined,
      }
  const existingContent = stdout

  // Update content
  await ssh.execCommand(`echo "${newContent}" | sudo tee ${location}`)
  // Check nginx status
  await checkNginxStatus(ssh).catch(async (err) => {
    // Restore original content or delete file
    if (exists) {
      await ssh.execCommand(`echo "${existingContent}" | sudo tee ${location}`)
    } else {
      await ssh.execCommand(`sudo rm ${location}`)
    }
    await checkNginxStatus(ssh)
    throw {
      message: `Nginx config update failed: ${err.message}`,
    }
  })

  // Reload nginx
  await ssh.execCommand("sudo nginx -s reload")
}