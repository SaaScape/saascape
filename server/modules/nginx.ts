import fsp from "fs/promises"
import path from "path"
import { IDomain } from "../schemas/Domains"
export const getDomainConfigFile = async (domain: IDomain) => {
  let baseDomainConfig = await fsp.readFile(
    path.join(__dirname, "../", "configs", "nginxDomainBaseConfig.conf"),
    { encoding: "utf-8" }
  )

  baseDomainConfig = baseDomainConfig.replaceAll(
    /<DOMAIN>/gi,
    domain.domain_name
  )

  return baseDomainConfig
}
