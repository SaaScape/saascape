export interface ILinkedId {
  _id: string
  name: string // Name of the integration
}
export interface ILinkedIdEnabledDocument {
  linked_ids: ILinkedId[]
}
