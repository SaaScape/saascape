/*
 * Copyright SaaScape (c) 2024.
 */

import React, { useEffect, useRef, useState } from 'react'
import ViewDeployment from './ViewDeployment.tsx'
import { IApplicationProps } from '../ApplicationRouteHandler.tsx'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs.tsx'
import breadcrumbs from '../../../helpers/constants/breadcrumbs.ts'
import { useParams } from 'react-router-dom'
import { IDeployment } from 'types/schemas/Deployments.ts'
import { useSelector } from 'react-redux'
import { IStore } from '../../../store/store.ts'
import { Deployment } from '../../../modules/deployment.ts'
import { IApplication } from 'types/schemas/Applications.ts'
import IInstance from 'types/schemas/Instances.ts'

export interface ViewProps {
  deployment?: IDeployment
  loading: boolean
  selectedApplication: IApplication | null
  targetInstances: IInstance[]
}

function ViewDeploymentContainer({ setId }: IApplicationProps) {
  const [deployment, setDeployment] = useState<IDeployment>()
  const [targetInstances, setTargetInstances] = useState<IInstance[]>([])
  const [loading, setLoading] = useState(true)

  const deploymentClassRef = useRef<Deployment>()
  const deploymentClass = deploymentClassRef?.current

  const { selectedApplication } = useSelector((state: IStore) => state.applications)

  const params = useParams()
  const { id, deploymentId } = params
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setId(id)
  }, [id])

  useEffect(() => {
    if (!id || !deploymentId) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_DEPLOYMENT(
        selectedApplication?.application_name || id,
        id,
        deploymentId,
        deployment?.name,
      ),
    )
  }, [deployment, selectedApplication])

  useEffect(() => {
    if (!selectedApplication?._id) return
    deploymentClassRef.current = new Deployment(selectedApplication?._id?.toString(), {
      deploymentId: deploymentId || '',
    })
  }, [selectedApplication, deploymentClassRef])

  useEffect(() => {
    getDeployment()
  }, [deploymentClass])

  const getDeployment = async () => {
    setLoading(true)
    const response = await deploymentClass?.getDeployment()
    const { deployment, targetInstances } = response
    setLoading(false)
    if (!deployment) return
    setDeployment(deployment)
    setTargetInstances(targetInstances)
  }

  const viewProps: ViewProps = { deployment, loading, selectedApplication, targetInstances }

  return <ViewDeployment {...viewProps} />
}

export default ViewDeploymentContainer
