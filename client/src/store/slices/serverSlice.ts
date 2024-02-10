import { createSlice } from "@reduxjs/toolkit"
import {
  IEncryptedData,
  ILinkedIdEnabledDocument,
} from "../../interfaces/interfaces"

export interface IServerState extends ILinkedIdEnabledDocument {
  _id: string
  server_ip_address: string
  ssh_port: number
  admin_username: IEncryptedData
  private_key: IEncryptedData
  server_name: string
  status: string
  server_status: string
  availability: string
  availability_changed: Date
  docker_data?: {
    certs?: {
      ca: IEncryptedData
      server: {
        cert: IEncryptedData
        key: IEncryptedData
      }
      client: {
        cert: IEncryptedData
        key: IEncryptedData
      }
    }
    availability: {
      status: string
      updated_at: Date
      message: string
    }
  }
  created_at: Date
  updated_at: Date
}

type InitialState = IServerState[]

const initialState: InitialState = []

const serverSlice = createSlice({
  name: "servers",
  initialState,
  reducers: {
    setServers(state, action) {
      const { payload } = action
      state = payload
      return state
    },
    addServers(state, action) {
      const { payload } = action
      state.push(...payload)
    },
    updateServer(state, action) {
      const { payload } = action
      const serverIndex = state.findIndex(
        (server) => server._id === payload._id
      )

      if (serverIndex !== -1) {
        state[serverIndex] = payload
      } else {
        state.push(payload)
      }
    },
    removeServer(state, action) {
      const { payload } = action
      state = state.filter((item: IServerState) => item._id !== payload?._id)
    },
  },
})

export default serverSlice.reducer
export const { addServers, updateServer, removeServer, setServers } =
  serverSlice.actions
