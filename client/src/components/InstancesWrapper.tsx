/*
 * Copyright SaaScape (c) 2024.
 */

import { createContext, useEffect, useReducer } from 'react'
import { toast } from 'react-toastify'
import IInstance from 'types/schemas/Instances.ts'
import { apiAxiosClean } from '../helpers/axios.ts'
import socket from '../sockets/sockets.ts'
import { InstanceSocketEvents } from 'types/sockets.ts'

interface IInstancesWrapperContext {
  deployments: IDeployment[]
  startDeployment: (instance: IInstance) => Promise<any>
  progressDeployment: (instanceId: string, stage: DeploymentStages) => void
  failDeployment: (instanceId: string, errorReason: string) => void
}
interface IDeploymentActions {
  action: deploymentActions
  payload: IDeployment
}

interface IDeployment {
  instance: IInstance
  stage: DeploymentStages
}

export enum deploymentActions {
  ADD_DEPLOYMENT = 'ADD_DEPLOYMENT',
  UPDATE_STAGE = 'UPDATE_STAGE',
}

export enum toastActions {
  SET_STAGE = 'SET_STAGE',
  CREATE_TOAST = 'CREATE_TOAST',
}

interface IToastsActions {
  action: toastActions
  instance: IInstance
  toastId?: string | number
}

export enum DeploymentStages {
  UPDATING = 0,
  DEPLOYING = 1,
  DEPLOYED = 2,
}

export const InstancesWrapperContext = createContext<IInstancesWrapperContext>({
  deployments: [],
  startDeployment: async () => {
    return {}
  },
  progressDeployment: () => {},
  failDeployment: () => {},
})

const deploymentReducer = (state: IDeployment[], action: IDeploymentActions) => {
  switch (action.action) {
    case deploymentActions.ADD_DEPLOYMENT:
      if (state.some((deployment) => deployment.instance?._id === action.payload.instance?._id)) return state
      return [...state, action.payload]
    case deploymentActions.UPDATE_STAGE:
      return state.map((deployment) => {
        if (deployment.instance?._id !== action.payload.instance?._id) return deployment
        return { ...deployment, stage: action.payload.stage }
      })
  }

  throw new Error('Invalid action')
}

const toastsReducer = (state: IToasts, action: IToastsActions) => {
  switch (action.action) {
    case toastActions.SET_STAGE:
    case toastActions.CREATE_TOAST:
      return {
        ...state,
        deployments: {
          ...state.deployments,
          [action.instance?._id?.toString()]: action.toastId || '',
        },
      }
  }

  return state
}

interface IToasts {
  deployments: {
    [instanceId: string]: string | number
  }
}

interface IProps {
  children: React.ReactNode
}
const InstancesWrapper = ({ children }: IProps) => {
  const [deployments, dispatchDeployment] = useReducer(deploymentReducer, [])
  const [toasts, dispatchToasts] = useReducer(toastsReducer, { deployments: {} })

  const startDeployment = async (instance: IInstance) => {
    const existingDeployment = deployments.some(
      (deployment) => deployment.instance?._id?.toString() === instance?._id?.toString(),
    )
    if (existingDeployment) {
      return toast.error('Deployment already in progress')
    }
    const toastId = toast.info(
      <div>
        <p>Instance: {instance?.name}</p>
        <p>Deployment in progress...</p>
      </div>,
      {
        closeButton: false,
        closeOnClick: false,
        isLoading: true,
      },
    )

    dispatchDeployment({
      action: deploymentActions.ADD_DEPLOYMENT,
      payload: { instance: instance, stage: DeploymentStages.UPDATING },
    })
    dispatchToasts({ action: toastActions.CREATE_TOAST, instance, toastId })

    const {
      data: { success, data, error },
    } = await apiAxiosClean.put(
      `/applications/${instance?.application_id}/instances/${instance?._id?.toString()}/deploy`,
    )

    if (!success) {
      toast.update(toastId, {
        type: 'error',
        isLoading: false,
        render: (
          <div>
            <p>Instance: {instance?.name}</p>
            <p>Deployment failed...</p>
            <p>{error}</p>
          </div>
        ),
      })
      return
    }

    toast.update(toastId, {
      type: 'info',
      render: (
        <div>
          <p>Instance: {instance?.name}</p>
          <p>Deployment updated...</p>
        </div>
      ),
    })

    return { instance: data?.instance?.instance as IInstance }
  }

  useEffect(() => {
    socket.on(InstanceSocketEvents.INSTANCE_DEPLOYED, (data: any) => {
      const { instance_id } = data
      const deployment = deployments?.find((deployment) => deployment.instance?._id === instance_id)
      if (!deployment) return
      progressDeployment(instance_id, DeploymentStages.DEPLOYED)
    })

    socket.on(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED, (data: any) => {
      const { instance_id, error } = data
      const deployment = deployments?.find((deployment) => deployment.instance?._id === data?.instance_id)
      if (!deployment) return
      failDeployment(instance_id, error?.message)
    })

    return () => {
      socket.off(InstanceSocketEvents.INSTANCE_DEPLOYED)
      socket.off(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED)
    }
  }, [deployments])

  const progressDeployment = (instanceId: string, stage: DeploymentStages) => {
    const deployment = deployments.find((deployment) => deployment.instance?._id?.toString() === instanceId)
    if (!deployment) return

    dispatchDeployment({
      action: deploymentActions.UPDATE_STAGE,
      payload: { instance: deployment?.instance, stage },
    })

    const toastId = toasts.deployments?.[instanceId]

    switch (stage) {
      case DeploymentStages.DEPLOYING:
        console.log('updated')
        toast.update(toastId, {
          type: 'info',
          render: (
            <div>
              <p>Instance: {deployment?.instance?.name}</p>
              <p>Deployment</p>
            </div>
          ),
        })
        break
      case DeploymentStages.DEPLOYED:
        toast.update(toastId, {
          type: 'success',
          render: (
            <div>
              <p>Instance: {deployment?.instance?.name}</p>
              <p>Deployment completed...</p>
            </div>
          ),
        })
        break
    }
  }

  const failDeployment = (instanceId: string, errorReason: string) => {
    const deployment = deployments.find((deployment) => deployment.instance?._id?.toString() === instanceId)
    console.log(deployment, deployments)
    if (!deployment) return
    const toastId = toasts.deployments?.[instanceId]
    console.log(toastId)
    toast.update(toastId, {
      isLoading: false,
      type: 'error',
      closeOnClick: true,
      closeButton: true,
      render: (
        <div>
          <p>Instance: {deployment?.instance?.name}</p>
          <p>Deployment failed...</p>
          <p>{errorReason}</p>
        </div>
      ),
    })
  }

  console.log(deployments, toasts)

  // const [toasts, setToasts] = useState<IToasts>({ deployments: {} })

  // TODO: Add socket events to listen for deployment status updates
  // TODO: Update toasts based on deployment status
  // Proceed with following steps and perhaps convert toasts to a reducer to allow for easier management of toasts and their statuses
  // Stages and associated functions for toasts to be updated depending on status
  // Example when server accepts changes we update toast, accepted.
  // When picked up by worker, we update toast, picked up.
  // When worker completes, we update toast, completed.

  // TODO: Instances wrapper should handle all deployment related tasks export certain methods that will be used by other components calling the context

  console.log(toasts)

  return (
    <InstancesWrapperContext.Provider value={{ deployments, startDeployment, progressDeployment, failDeployment }}>
      {children}
    </InstancesWrapperContext.Provider>
  )
}

export default InstancesWrapper
