import { ObjectId } from "mongodb"

export default interface IError {
  message?: string
  showError?: string
  showWarning?: string
  status?: number
  entity_id?: ObjectId
}
