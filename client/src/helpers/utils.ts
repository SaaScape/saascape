import { setApplications, setSelectedApplication } from '../store/slices/applicationSlice'
import { store } from '../store/store'
import { apiAxios } from './axios'
import constants from './constants/constants'
// import publicKeyJson from '../data/clientTransportKeys/publicKey.json'
// import JSEncrypt from 'jsencrypt'
import { snakeCase } from 'lodash'
import { IApplication } from 'types/schemas/Applications.ts'

export const queryParamBuilder = (query: { [key: string]: string | number | undefined }) => {
  return `?${Object.entries(query)
    .map((param) => `${param[0]}=${param[1]}`)
    .join('&')}`
}

export const retrieveAndSetApplications = async (applicationId: string) => {
  if (!applicationId) return
  const foundAppCached = store
    .getState()
    .applications?.applications?.find((app: IApplication) => app._id === applicationId)
  if (foundAppCached) {
    store.dispatch(setSelectedApplication(foundAppCached))
    console.log('found cached app')
    return
  }
  console.log('searching through api')
  const {
    data: { data, success },
  } = await apiAxios.get(`/applications`)
  if (success) {
    store.dispatch(setApplications(data?.applications))
    store.dispatch(setSelectedApplication(data?.applications.find((app: IApplication) => app._id === applicationId)))
  }
  return data || []
}

export const getCurrency = (currency: string) => {
  const { defaultCurrency, currencies } = store.getState().configData
  return {
    currency: currencies?.[currency] || defaultCurrency,
    defaultCurrency,
  }
}

export const planTermConverter = (term: string) => {
  const values = {
    [constants.BILLING_INTERVAL.DAY]: 'Day',
    [constants.BILLING_INTERVAL.WEEK]: 'Week',
    [constants.BILLING_INTERVAL.MONTH]: 'Month',
    [constants.BILLING_INTERVAL.ANNUAL]: 'Year',
  }
  return values?.[term]
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

// export const decryptServerTransport = async (data: any) => {
//   const { privateKey } = publicKeyJson
//   if (!privateKey) throw new Error('Private key not found')
//
//   const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')
//
//   const jsEncrypt = new JSEncrypt()
//   jsEncrypt.setPrivateKey(formattedPrivateKey)
//
//   const decryptedData = jsEncrypt.decrypt(data)
//   return decryptedData
// }
//
// export const encryptServerTransport = async (data: any) => {
//   const { publicKey } = publicKeyJson
//   if (!publicKey) throw new Error('Public key not found')
//
//   const formattedPublicKey = publicKey.replace(/\\n/g, '\n')
//
//   const jsEncrypt = new JSEncrypt()
//   jsEncrypt.setPublicKey(formattedPublicKey)
//
//   const encryptedData = jsEncrypt.encrypt(data)
//   return encryptedData
// }

export const serverLookupByIp = (ip: string, type: 'public' | 'private' = 'public') => {
  const { servers = [] } = store.getState()

  return servers.find((server) => server?.server_ip_address === ip)
}

export type CSVData = IRowObj[]

interface IRowObj {
  [key: string]: string
}

export const CSVToArray = (csv: string) => {
  const csvArray = csv.split('\n')
  const headers = csvArray[0].split(',')

  const csvObj: CSVData = []

  for (const row of csvArray.slice(1)) {
    const rowObj: IRowObj = {}
    const rowValues = row.split(',')

    for (const [index, title] of headers.entries()) {
      rowObj[snakeCase(title)] = rowValues[index]?.trim()
    }

    csvObj.push(rowObj)
  }
  return csvObj
}

export const checkIfCSVValid = (csv: CSVData, requiredHeaders: string[]) => {
  const headers = Object.keys(csv[0])
  return requiredHeaders.every((header) => headers.includes(header))
}
