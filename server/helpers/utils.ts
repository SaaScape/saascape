import crypto from 'crypto'
import { IApplication } from 'types/schemas/Applications'
import fsp from 'fs/promises'
import path from 'path'
import IInstance from 'types/schemas/Instances'
import NotificationService, { INotificator } from '../services/notificationService'
import { db } from '../db'
import { IUser } from '../schemas/Users'
import constants from './constants'
import { clientIO } from '../background/init/sockets'
import { NotificationEvents } from 'types/sockets'
import { notificationType } from 'types/schemas/Notifications'
import { ObjectId } from 'mongodb'
import { sendEmail } from './email'
const algorithm = 'aes-256-cbc'

export const checkForMissingParams = (params: { [key: string]: any }, requiredParams: string[]) => {
  const missingParams = requiredParams.filter((param) => !params[param])
  if (missingParams.length > 0) {
    throw { showError: `Missing required params: ${missingParams.join(', ')}` }
  }
}

export const getMissingFields = (params: { [key: string]: any }, requiredParams: string[]) => {
  const missingParams = requiredParams.filter((param) => !params[param])
  return missingParams
}

export const encryptData = (data: string) => {
  const { ENCRYPTION_KEY } = process.env
  if (!ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY')
  const iv = crypto.randomBytes(16)

  let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'base64'), iv)
  let encrypted = cipher.update(data)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return {
    iv: Buffer.from(iv).toString('base64'),
    encryptedData: encrypted.toString('base64'),
  }
}

export const decipherData = (data: string, iv: string) => {
  const { ENCRYPTION_KEY } = process.env
  if (!ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'base64'), Buffer.from(iv, 'base64'))
  let decrypted = decipher.update(data, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export const encryptClientTransport = async (data: string) => {
  const { TRANSPORT_KEY_PATH } = process.env
  if (!TRANSPORT_KEY_PATH) throw new Error('Missing TRANSPORT_KEY_PATH')

  const publicKey = await fsp.readFile(path.join(TRANSPORT_KEY_PATH, 'publicKey.pem'))

  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(data, 'utf-8'),
  )

  return encryptedData.toString('base64')
}

export const decryptClientTransport = async (data: string) => {
  const { TRANSPORT_KEY_PATH } = process.env
  if (!TRANSPORT_KEY_PATH) throw new Error('Missing TRANSPORT_KEY_PATH')

  const privateKey = await fsp.readFile(path.join(TRANSPORT_KEY_PATH, 'privateKey.pem'))

  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(data, 'base64'),
  )

  return decryptedData.toString('utf-8')
}

type StorageUnits = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
export const convertUnit = (value: number, currentUnit: StorageUnits, newUnit: StorageUnits) => {
  const units: StorageUnits[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  if (!units.includes(currentUnit) || !units.includes(newUnit)) {
    throw new Error('Invalid unit')
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

export const cleanVersionConfig = (application: IApplication, configFieldsToRemove: string[]) => {
  const { config } = application
  const { version_config } = config || {}

  if (!version_config) return

  for (const field in version_config) {
    if (configFieldsToRemove.includes(field)) {
      delete (version_config as any)[field]
    }
  }
}

export const prepareApplicationPayloadForTransport = async (entity: IApplication | IInstance) => {
  const { config } = entity
  if (!config) return
  const { secrets_config } = config

  const preparedSecrets: { [key: string]: any } = {}

  for (const secret of Object.values(secrets_config)) {
    try {
      const decipheredValue = decipherData(secret?.value?.encryptedData, secret?.value?.iv)

      preparedSecrets[secret?._id?.toString()] = {
        ...secret,
        value: decipheredValue,
      }
    } catch (err) {
      console.warn(err)
    }
  }

  entity.config.secrets_config = preparedSecrets
}

export interface INotificationFromBackground {
  title: string
  body: string
  sendMail: boolean
  type: notificationType
  link?: string
  from: 'system' | ObjectId
}

export enum NotificationMethods {
  BACKGROUND = 'background',
  MAIN_SERVER = 'main_server',
}

export const createNotifications = async (
  { title, body, sendMail, type, link, from }: INotificationFromBackground,
  method: NotificationMethods,
) => {
  const notificationPayloads: INotificator[] = []
  const users =
    (await db.managementDb
      ?.collection<IUser>('users')
      .find({
        status: constants.STATUSES.ACTIVE_STATUS,
      })
      .toArray()) || []

  for (const user of users) {
    notificationPayloads.push({
      title,
      body,
      type,
      from,
      to: user._id,
      sendMail,
      link,
      isBackground: method === NotificationMethods.BACKGROUND,
    })
  }

  if (method === NotificationMethods.MAIN_SERVER) {
    const notificationService = new NotificationService()
    await notificationService.createMany(notificationPayloads)
  } else {
    clientIO.emit(NotificationEvents.NEW_NOTIFICATIONS, notificationPayloads)
    if (sendMail) {
      // Ensure that in this case we are sending the mail from the background server to prevent clogging the main server
      const emailString = users?.map((user) => user.email).join(',')
      if (!emailString) return
      await sendEmail({
        bcc: emailString,
        subject: title,
        html: body,
      })
    }
  }
}
