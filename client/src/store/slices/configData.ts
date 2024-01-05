import { createSlice } from "@reduxjs/toolkit"

export interface ICurrency {
  symbol: string
  name: string
  symbol_native: string
  decimal_digits: number
  rounding: number
  code: string
  name_plural: string
}
export interface IConfigData {
  menuOpen: boolean
  integrations: {
    [key: string]: any[]
  }
  enabledIntegrations: {
    [key: string]: boolean
  }
  currencies: { [key: string]: ICurrency }
  defaultCurrency: ICurrency
}

const initialState = {
  menuOpen: true,
  integrations: {},
  enabledIntegrations: {},
  currencies: [],
  defaultCurrency: null,
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
