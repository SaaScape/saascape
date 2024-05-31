/*
 * Copyright SaaScape (c) 2024.
 */

import { createSlice } from '@reduxjs/toolkit'
import IInstance, { IInstanceHealth, IInstanceHealths } from 'types/schemas/Instances.ts'

export enum deploymentStages {
  UPDATING = 0,
  DEPLOYING = 1,
  DEPLOYED = 2,
  FAILED = 4,
}

interface IDeployment {
  instance: IInstance
  stage?: deploymentStages
}

export interface IInstancesState {
  deployments: IDeployment[]
  instanceHealths: IInstanceHealths
}

const initialState: IInstancesState = { deployments: [], instanceHealths: {} }

interface IDeploymentActions {
  AddDeployment: {
    payload: {
      instance: IInstance
    }
  }
  RemoveDeployment: {
    payload: {
      instanceId: string
    }
  }
  UpdateStage: {
    payload: {
      instanceId: string
      stage: deploymentStages
    }
  }
  UpdateInstanceHealth: {
    payload: IInstanceHealth
  }
  BulkUpdateInstanceHealth: {
    payload: IInstanceHealths
  }
}

const instancesSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    addDeployment: (state, action: IDeploymentActions['AddDeployment']) => {
      const { instance } = action.payload
      const deploymentObj: IDeployment = {
        instance,
        stage: deploymentStages.UPDATING,
      }
      state.deployments.push(deploymentObj)
      return state
    },
    removeDeployment: (state, action: IDeploymentActions['RemoveDeployment']) => {
      const { instanceId } = action.payload
      state.deployments = state.deployments.filter((deployment) => deployment.instance._id?.toString() !== instanceId)
      return state
    },
    updateStage: (state, action: IDeploymentActions['UpdateStage']) => {
      const { instanceId, stage } = action.payload
      const deployment = state.deployments.find((deployment) => deployment.instance._id?.toString() === instanceId)
      if (deployment) {
        deployment.stage = stage
      }
      return state
    },
    updateInstanceHealth: (state, action: IDeploymentActions['UpdateInstanceHealth']) => {
      const { payload } = action
      state.instanceHealths[payload.instance_id] = payload
      return state
    },
    bulkUpdateInstanceHealth: (state, action: IDeploymentActions['BulkUpdateInstanceHealth']) => {
      const { payload } = action
      state.instanceHealths = {
        ...state.instanceHealths,
        ...payload,
      }
      return state
    },
  },
})

export default instancesSlice.reducer
export const { addDeployment, removeDeployment, updateStage, updateInstanceHealth, bulkUpdateInstanceHealth } =
  instancesSlice.actions
