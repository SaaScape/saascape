import { createSlice } from "@reduxjs/toolkit"

export interface ISwarm {
  _id: string
  name: string
  ID: string
  created_at: Date
  updated_at: Date
}

type InitialState = ISwarm[]

const initialState: InitialState = []

const swarmSlice = createSlice({
  name: "swarms",
  initialState,
  reducers: {
    setSwarms(state, action) {
      const { payload } = action
      state = payload
      return state
    },
    addSwarm(state, action) {
      const { payload } = action
      state.push(...payload)
    },
    updateSwarm(state, action) {
      const { payload } = action
      const swarmIndex = state.findIndex((swarm) => swarm._id === payload._id)

      if (swarmIndex !== -1) {
        state[swarmIndex] = payload
      } else {
        state.push(payload)
      }
    },
    removeSwarm(state, action) {
      const { payload } = action
      state = state.filter((item) => item._id !== payload?._id)
    },
  },
})

export default swarmSlice.reducer
export const { addSwarm, updateSwarm, removeSwarm, setSwarms } =
  swarmSlice.actions
