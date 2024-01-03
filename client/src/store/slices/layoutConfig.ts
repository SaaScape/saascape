import { createSlice } from "@reduxjs/toolkit"

export interface ILayoutConfig {
  showBreadcrumbs: boolean
}

const initialState: ILayoutConfig = {
  showBreadcrumbs: true,
}

const layoutConfig = createSlice({
  name: "layoutConfig",
  initialState: initialState,
  reducers: {
    setLayoutConfig: (state, action) => {
      state = { ...state, ...action.payload }
      return state
    },
  },
})

export default layoutConfig.reducer
export const { setLayoutConfig } = layoutConfig.actions
