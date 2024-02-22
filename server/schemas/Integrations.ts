import { ObjectId } from "mongodb"

export type NodeType = "manager" | "worker"

export interface IIntegration {
  _id: ObjectId
  name: string
  status: string
  created_at: Date
  updated_at: Date
  config: {
    [key: string]: any
    swarm?: {
      swarm_id: ObjectId
      node_type: NodeType
    }
  }
  type: string
  module?: string
}
