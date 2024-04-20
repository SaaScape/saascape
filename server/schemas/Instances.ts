import { ObjectId } from "mongodb"
import { IEnvironmentVariablesConfig, ISecretsConfig } from "./Applications"
import IVersion from "./Versions"

export type serviceStatus =
  | "running" // Instance is running
  | "stopped" // Instance has stopped
  | "failed" // Instance has failed
  | "creating" // New instance has been picked up by queue and is being created
  | "pending" // After creating a new instance after fully configured
  | "pre-configured" // when creating a new instance before fully configured
  | "creation-failed" // when creating a new instance failed
  | "creation-success"

export default interface IInstance {
  _id: ObjectId
  service_status: serviceStatus
  name: string
  is_custom_database: boolean
  database: string | ObjectId
  config: {
    environment_variables: IEnvironmentVariablesConfig
    secrets_config: ISecretsConfig
  }
  version_id: ObjectId
  version?: IVersion
  application_id: ObjectId
  status: string
  swarm_id: ObjectId
  created_at: Date
  updated_at: Date
}
