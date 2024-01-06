import { createSlice } from "@reduxjs/toolkit"
import { ReactElement } from "react"

export interface IBreadcrumbs {
  title: string | ReactElement
  path: string
  type?: string
}

const initialState: IBreadcrumbs[] = []

const breadcrumbsSlice = createSlice({
  name: "breadcrumbs",
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
      state = action.payload
      return state
    },
  },
})

export default breadcrumbsSlice.reducer
export const { setBreadcrumbs } = breadcrumbsSlice.actions
