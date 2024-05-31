/*
 * Copyright SaaScape (c) 2024.
 */

import { useDispatch, useSelector } from 'react-redux'
import { IStore } from '../store/store.ts'
import {
  addDeployment as addDeploymentReducer,
  deploymentStages,
  IInstanceHealth,
  removeDeployment as removeDeploymentReducer,
  updateInstanceHealth,
  updateStage as updateStageReducer,
} from '../store/slices/instancesSlice.ts'
import IInstance from 'types/schemas/Instances.ts'
import { toast } from 'react-toastify'
import { useEffect, useRef } from 'react'
import { apiAxiosClean } from '../helpers/axios.ts'
import socket from '../sockets/sockets.ts'
import { InstanceSocketEvents } from 'types/sockets.ts'
import { instanceHealth } from 'types/enums.ts'

interface IToasts {
  deployments: {
    [instanceId: string]: string | number
  }
}

const toasts: IToasts = {
  deployments: {},
}

interface IManageInstances {
  children: React.ReactNode
}

const ManageInstances = ({ children }: IManageInstances) => {
  const { failDeployment, progressDeployment } = useManageInstances()
  const dispatch = useDispatch()

  useEffect(() => {
    socket.on(InstanceSocketEvents.INSTANCE_DEPLOYED, (data: any) => {
      progressDeployment(data.instance_id, deploymentStages.DEPLOYED)
    })

    socket.on(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED, (data: any) => {
      failDeployment(data.instance_id, data.error?.message)
    })

    socket.on(InstanceSocketEvents.UPDATE_HEALTH, (data: IInstanceHealth) => {
      dispatch(updateInstanceHealth(data))
    })

    return () => {
      socket.off(InstanceSocketEvents.INSTANCE_DEPLOYED)
      socket.off(InstanceSocketEvents.INSTANCE_DEPLOYMENT_FAILED)
    }
  }, [])

  // TODO: On instance health check, send socket event to update the instance status on the UI
  // TODO: Add instanceHealth to redux store and update it on instance health check this will aid in showing the health status of the instance on the UI

  return <>{children}</>
}

const useManageInstances = () => {
  const { deployments } = useSelector((state: IStore) => state.instances)

  const deploymentsRef = useRef(deployments)
  deploymentsRef.current = deployments

  const dispatch = useDispatch()

  const checkIfDeploymentInProgress = (instanceId: string) => {
    const deployment = deploymentsRef.current.find((deployment) => deployment.instance._id?.toString() === instanceId)
    return {
      inProgress: !!deployment,
      deployment,
    }
  }

  const updateToasts = (instanceId: string, toastId: string | number) => {
    toasts.deployments[instanceId] = toastId
  }

  const failDeployment = (instanceId: string, error: string) => {
    const { deployment } = checkIfDeploymentInProgress(instanceId)
    if (!deployment) return

    const toastId = toasts.deployments[instanceId]
    const { instance } = deployment

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

    dispatch(updateStageReducer({ instanceId: instance._id.toString(), stage: deploymentStages.FAILED }))
  }

  const addDeployment = async (instance: IInstance) => {
    const { inProgress, deployment } = checkIfDeploymentInProgress(instance._id.toString())

    if (deployment && inProgress) {
      // Check if the stage is failed or complete
      const { stage } = deployment
      if (!stage) return
      if (![deploymentStages.FAILED, deploymentStages.DEPLOYED].includes(stage)) {
        return toast.error('Deployment already in progress')
      }
      // Remove the deployment if it is failed or complete
      dispatch(removeDeploymentReducer({ instanceId: instance._id.toString() }))
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

    dispatch(addDeploymentReducer({ instance }))
    updateToasts(instance._id.toString(), toastId)

    const {
      data: { success, data, error },
    } = await apiAxiosClean.put(
      `/applications/${instance?.application_id}/instances/${instance?._id?.toString()}/deploy`,
    )

    if (!success) {
      failDeployment(instance?._id?.toString(), error)
      return
    }

    dispatch(updateStageReducer({ instanceId: instance?._id?.toString(), stage: deploymentStages.DEPLOYING }))

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

  const progressDeployment = (instanceId: string, stage: deploymentStages) => {
    const { deployment } = checkIfDeploymentInProgress(instanceId)

    if (!deployment) return

    const toastId = toasts.deployments[instanceId]

    dispatch(updateStageReducer({ instanceId: instanceId, stage }))

    switch (stage) {
      case deploymentStages.DEPLOYING:
        toast.update(toastId, {
          type: 'info',
          render: (
            <div>
              <p>Instance: {deployment?.instance?.name}</p>
              <p>Deploying...</p>
            </div>
          ),
        })
        break
      case deploymentStages.DEPLOYED:
        toast.update(toastId, {
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          autoClose: 3000,
          closeButton: true,
          render: (
            <div>
              <p>Instance: {deployment?.instance?.name}</p>
              <p>Deploying... Done</p>
              <p>Deployment completed...</p>
            </div>
          ),
        })
        break
    }
  }

  return { addDeployment, failDeployment, progressDeployment, deployments }
}

export { useManageInstances }
export default ManageInstances
