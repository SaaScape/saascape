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
import CreateDeploymentModal from '../../../components/Applications/Deployments/CreateDeploymentModal.tsx'

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
  const [showCreateDeploymentModal, setShowCreateDeploymentModal] = useState(false)

  const { selectedApplication } = useSelector((state: IStore) => state.applications)

  const deploymentClassRef = useRef<Deployment>()
  const deploymentClass = deploymentClassRef?.current
  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()

  const getDeploymentGroup = (_id: string) => {
    return selectedApplication?.config?.deployment_groups?.[_id]
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
      title: 'Initiated by',
      dataIndex: 'userObj',
      key: 'userObj',
      render: (_, deployment) => {
        const userObj = (deployment as any)?.user_obj
        let firstName = userObj?.first_name?.split('') || []
        firstName[0] = firstName?.[0]?.toUpperCase()
        firstName = firstName?.join('')
        let lastName = userObj?.last_name?.split('') || []
        lastName[0] = lastName?.[0]?.toUpperCase()
        lastName = lastName?.join('')

        return `${firstName} ${lastName}`
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

  const toggleShowDeploymentModal = (visible: boolean) => {
    setShowCreateDeploymentModal(visible)
  }

  const onCreate = async (values: any) => {
    deploymentClass?.createDeployment(values)
    toggleShowDeploymentModal(false)
    reload?.()
  }

  const createDeploymentModalProps = {
    onCancel: () => toggleShowDeploymentModal(false),
    open: showCreateDeploymentModal,
    onCreate,
    selectedApplication,
  }

  const viewProps: IViewProps = {
    loading,
    dataFetching,
    functions: {
      onSearch,
      onCreateClick: () => toggleShowDeploymentModal(true),
      onRow: (record) => ({
        onClick: () => {
          navigate(`/applications/${selectedApplication?._id}/deployments/${record?._id}`)
        },
      }),
    },
    columns,
    tableConfig,
    paginatedData,
    onTableChange,
  }

  return (
    <>
      <Deployments {...viewProps} />
      <CreateDeploymentModal {...createDeploymentModalProps} />
    </>
  )
}

export default DeploymentsContainer
