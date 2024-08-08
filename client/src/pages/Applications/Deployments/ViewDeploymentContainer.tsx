/*
 * Copyright SaaScape (c) 2024.
 */

import React, { useEffect, useRef, useState } from 'react'
import ViewDeployment from './ViewDeployment.tsx'
import { IApplicationProps } from '../ApplicationRouteHandler.tsx'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs.tsx'
import breadcrumbs from '../../../helpers/constants/breadcrumbs.ts'
import { useParams } from 'react-router-dom'
import { DeploymentStatus, IDeployment, TargetInstance } from 'types/schemas/Deployments.ts'
import { useSelector } from 'react-redux'
import { IStore } from '../../../store/store.ts'
import { Deployment, TargetDeploymentStatuses } from '../../../modules/deployment.ts'
import { IApplication } from 'types/schemas/Applications.ts'
import IInstance from 'types/schemas/Instances.ts'
import { TableProps } from 'antd/lib'
import moment from 'moment'
import RecordLink from '../../../components/RecordLink.tsx'

interface InstanceDeploymentPieData {
  name: string
  value: number
  color: string
}

export interface ViewProps {
  deployment?: IDeployment
  loading: boolean
  selectedApplication: IApplication | null
  targetInstanceDistribution?: InstanceDeploymentPieData[]
  deploymentColumns: TableProps<TargetInstance>['columns']
}

function ViewDeploymentContainer({ setId }: IApplicationProps) {
  const [deployment, setDeployment] = useState<IDeployment>()
  const [loading, setLoading] = useState(true)
  const [targetInstanceDistribution, setTargetInstanceDistribution] = useState<InstanceDeploymentPieData[]>([])

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

  const deploymentColumns: TableProps<TargetInstance>['columns'] = [
    {
      title: 'Instance Name',
      dataIndex: 'instance_name',
      key: 'instance_name',
      render: (text, record) => (
        <RecordLink
          entity={'instance'}
          label={text}
          link={`/applications/${selectedApplication?._id}/instances/${record?.instance_id}`}
          children={null}
        />
      ),
    },
    {
      title: 'Deployment Status',
      dataIndex: 'deployment_status',
      key: 'deployment_status',
    },
    {
      title: 'Last Update',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => moment(text).fromNow(),
    },
    {
      title: 'Completed',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (text) => {
        return text ? moment(text).fromNow() : 'N/A'
      },
    },
  ]

  const getPieData = () => {
    const targetDistribution = deploymentClass?.getTargetStatusDistribution()
    setTargetInstanceDistribution(
      Object.entries(targetDistribution || {}).map(([status, { value, color }]) => {
        return {
          name: status,
          value,
          color,
        }
      }),
    )
  }

  const getDeployment = async () => {
    setLoading(true)
    const response = await deploymentClass?.getDeployment()
    const { deployment } = response || { targetInstances: [] }
    setLoading(false)
    if (!deployment) return
    setDeployment(deployment)
    getPieData()
  }

  const viewProps: ViewProps = {
    deployment,
    loading,
    selectedApplication,
    targetInstanceDistribution,
    deploymentColumns,
  }

  return <ViewDeployment {...viewProps} />
}

export default ViewDeploymentContainer
