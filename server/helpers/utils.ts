import crypto from "crypto"
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
