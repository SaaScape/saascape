import { createSlice } from "@reduxjs/toolkit"

export interface IUserState {
  _id: string
  username: string
  first_name: string
  last_name: string
  email: string
  groups: string[]
  status: string
  created_at: Date
  updated_at: Date
  permissions: string[]
}

type InitialState = IUserState | { [key: string]: any }

const initialState: InitialState = {}
const userSlice = createSlice({
  initialState: initialState,
  name: "user",
  reducers: {
    initializeUser: (_, action) => {
      const { payload } = action
      return payload
    },
    updatePermissions: (state, action) => {
      state.permissions = action.payload
    },
  },
})

export default userSlice.reducer
export const { initializeUser } = userSlice.actions
