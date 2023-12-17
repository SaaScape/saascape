import { createSlice } from "@reduxjs/toolkit"

export interface IConfigData {
  menuOpen: boolean
}

const initialState = {
  menuOpen: true,
}

const configDataSlice = createSlice({
  name: "configData",
  initialState: initialState,
  reducers: {
    setConfigData: (state, action) => {
      state = { ...state, ...action.payload }
      return state
    },
  },
})

export default configDataSlice.reducer
export const { setConfigData } = configDataSlice.actions
