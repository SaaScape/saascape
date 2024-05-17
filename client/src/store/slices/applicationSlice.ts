/*
 * Copyright SaaScape (c) 2024.
 */

import { createSlice } from '@reduxjs/toolkit'
import { IEncryptedData, ILinkedIdEnabledDocument } from '../../interfaces/interfaces'

export interface ICustomField {
  _id: string
  field: string
  type: string
  label: string
  options?: string[]
}

export type ContactType = 'tenant' | 'lead'

export interface ICustomField {
  _id: string
  field: string
  type: string
  label: string
  options?: string[]
}

export interface ISecret {
  _id: string
  name: string
  value: IEncryptedData
}

export interface IEnvironmentVariable {
  _id: string
  name: string
  value: string
}

export interface IEnvironmentVariablesConfig {
  [key: string]: IEnvironmentVariable
}

export interface ISecretsConfig {
  [key: string]: ISecret
}

export interface IApplicationConfig {
  version_config: {
    docker_hub_webhooks?: boolean
  }
  secrets_config: ISecretsConfig

  environment_config: IEnvironmentVariablesConfig
  nginx: {
    directives?: string
  }
}

export interface IApplication extends ILinkedIdEnabledDocument {
  _id: string
  application_name: string
  status: string
  description: string
  custom_fields: ICustomField[]
  config: IApplicationConfig
  created_at: Date
  updated_at: Date
}

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
