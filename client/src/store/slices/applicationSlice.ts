/*
 * Copyright SaaScape (c) 2024.
 */

import { createSlice } from '@reduxjs/toolkit'
import { IApplication } from 'types/schemas/Applications.ts'

const initialState: {
  selectedApplication: IApplication | null
  applications: IApplication[]
} = {
  selectedApplication: null,
  applications: [],
}

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplications: (state, action) => {
      state = { ...state, applications: action.payload }
      return state
    },
    updateApplication: (state, action) => {
      const application = action.payload
      const index = state.applications.findIndex((app) => app._id === application._id)
      state.applications[index] = application
      if (state?.selectedApplication?._id === application._id) {
        state.selectedApplication = application
      }

      return state
    },
    setSelectedApplication: (state, action) => {
      state = { ...state, selectedApplication: action.payload }
      return state
    },
  },
})

export default applicationsSlice.reducer
export const { setApplications, setSelectedApplication, updateApplication } = applicationsSlice.actions
