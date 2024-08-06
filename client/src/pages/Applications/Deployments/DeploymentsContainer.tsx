/*
 * Copyright SaaScape (c) 2024.
 */

import React, { useEffect, useRef, useState } from 'react'
import Deployments from './Deployments.tsx'
import { IApplicationProps } from '../ApplicationRouteHandler.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs.tsx'
import { useSelector } from 'react-redux'
import breadcrumbs from '../../../helpers/constants/breadcrumbs.ts'
import { IStore } from '../../../store/store.ts'
import { TableProps } from 'antd/lib'
import { IDeployment } from 'types/schemas/Deployments.ts'
import { Deployment } from '../../../modules/deployment.ts'
import usePaginatedTable from '../../../hooks/usePaginatedTable.tsx'
import moment from 'moment'
import { Popover } from 'antd'

export interface IViewProps {
  loading: boolean
  columns: any[]
  tableConfig: any
  onTableChange: any
  paginatedData: any
  dataFetching: boolean
  functions: { [functionName: string]: (...args: any[]) => any }
}

const DeploymentsContainer = (props: IApplicationProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { selectedApplication } = useSelector((state: IStore) => state.applications)

  const deploymentClassRef = useRef<Deployment>()
  const deploymentClass = deploymentClassRef?.current
  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()

  const getDeploymentGroup = (_id: string) => {
    return Object.values(selectedApplication?.config?.deployment_groups || {}).find(
      (deploymentGroupId) => deploymentGroupId.toString() === _id,
    )
  }

  const { tableConfig, paginatedData, onSearch, dataFetching, reload, onTableChange } = usePaginatedTable({
    apiUrl: `/applications/${id}/deployments`,
    sortField: 'updated_at',
    useCustomFetchMethod: true,
    customFetchClass: deploymentClass,
  })

  useEffect(() => {
    props.setId(id)
    reload?.()
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(breadcrumbs.VIEW_APPLICATION_DEPLOYMENTS(selectedApplication?.application_name || id, id))
  }, [selectedApplication])

  useEffect(() => {
    if (!selectedApplication?._id) return
    deploymentClassRef.current = new Deployment(selectedApplication?._id?.toString())
  }, [selectedApplication])

  const columns: TableProps<IDeployment>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Deployment Group',
      dataIndex: 'deployment_group',
      key: 'deployment_group',
      render: (_, record) => getDeploymentGroup(record?.deployment_group?.toString())?.name || 'N/A',
    },
    {
      title: 'Version',
      dataIndex: 'version_obj',
      key: 'version',
      render: (version) => {
        const text = `${version?.namespace}/${version?.repository}:${version?.tag}`
        return text || '-'
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (_, record) => (
        <Popover content={<span>{moment(record?.updated_at).format('LLL')}</span>}>
          {moment(record.updated_at).fromNow()}
        </Popover>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (_, record) => (
        <Popover content={<span>{moment(record?.updated_at).format('LLL')}</span>}>
          {moment(record.created_at).fromNow()}
        </Popover>
      ),
    },
  ]

  const viewProps: IViewProps = {
    loading,
    dataFetching,
    functions: {
      onSearch,
    },
    columns,
    tableConfig,
    paginatedData,
    onTableChange,
  }

  return <Deployments {...viewProps} />
}

export default DeploymentsContainer
