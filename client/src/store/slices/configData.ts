import { createSlice } from "@reduxjs/toolkit"

export interface IConfigData {
  menuOpen: boolean
  integrations: {
    [key: string]: any[]
  }
  enabledIntegrations: {
    [key: string]: boolean
  }
}

const initialState = {
  menuOpen: true,
  integrations: {},
  enabledIntegrations: {},
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
