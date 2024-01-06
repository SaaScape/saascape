import { createSlice } from "@reduxjs/toolkit"

export interface IApplication {
  application_name: string
  created_at: Date
  updated_at: Date
  _id: string
  description: string
}

const initialState: {
  selectedApplication: string | null
  applications: IApplication[]
} = {
  selectedApplication: null,
  applications: [],
}

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state = { ...state, applications: action.payload }
      return state
    },
    setSelectedApplication: (state, action) => {
      state = { ...state, selectedApplication: action.payload }
      return state
    },
  },
})

export default applicationsSlice.reducer
export const { setApplications, setSelectedApplication } =
  applicationsSlice.actions
