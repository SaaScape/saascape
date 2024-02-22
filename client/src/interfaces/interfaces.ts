export interface ILinkedId {
  _id: string
  name: string // Name of the integration
  integration_id: string
}
export interface ILinkedIdEnabledDocument {
  linked_ids: ILinkedId[]
}

export interface IEncryptedData {
  iv: string
  encryptedData: string
}
