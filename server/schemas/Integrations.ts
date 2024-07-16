import { ObjectId } from 'mongodb'
import { SwarmNodeTypes } from 'types/enums'

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
      node_type: SwarmNodeTypes
    }
  }
  type: string
  module?: string
}
