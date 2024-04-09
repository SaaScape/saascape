import crypto from "crypto"
import { IApplication } from "../schemas/Applications"
const algorithm = "aes-256-cbc"

export const checkForMissingParams = (
  params: { [key: string]: any },
  requiredParams: string[]
) => {
  const missingParams = requiredParams.filter((param) => !params[param])
  if (missingParams.length > 0) {
    throw { showError: `Missing required params: ${missingParams.join(", ")}` }
  }
}

export const getMissingFields = (
  params: { [key: string]: any },
  requiredParams: string[]
) => {
  const missingParams = requiredParams.filter((param) => !params[param])
  return missingParams
}

export const encryptData = (data: string) => {
  const { ENCRYPTION_KEY } = process.env
  if (!ENCRYPTION_KEY) throw new Error("Missing ENCRYPTION_KEY")
  const iv = crypto.randomBytes(16)

  let cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "base64"),
    iv
  )
  let encrypted = cipher.update(data)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return {
    iv: Buffer.from(iv).toString("base64"),
    encryptedData: encrypted.toString("base64"),
  }
}

export const decipherData = (data: string, iv: string) => {
  const { ENCRYPTION_KEY } = process.env
  if (!ENCRYPTION_KEY) throw new Error("Missing ENCRYPTION_KEY")
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "base64"),
    Buffer.from(iv, "base64")
  )
  let decrypted = decipher.update(data, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

type StorageUnits = "B" | "KB" | "MB" | "GB" | "TB" | "PB"
export const convertUnit = (
  value: number,
  currentUnit: StorageUnits,
  newUnit: StorageUnits
) => {
  const units: StorageUnits[] = ["B", "KB", "MB", "GB", "TB", "PB"]
  if (!units.includes(currentUnit) || !units.includes(newUnit)) {
    throw new Error("Invalid unit")
  }
  const byteMultipliers: { [key: string]: number } = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
    PB: 1024 * 1024 * 1024 * 1024 * 1024,
  }

  const valueInBytes = value * byteMultipliers[currentUnit]
  const newValue = valueInBytes / byteMultipliers?.[newUnit]
  return newValue
}

export const cleanVersionConfig = (
  application: IApplication,
  configFieldsToRemove: string[]
) => {
  const { config } = application
  const { version_config } = config || {}

  if (!version_config) return

  for (const field in version_config) {
    if (configFieldsToRemove.includes(field)) {
      delete (version_config as any)[field]
    }
  }
}
