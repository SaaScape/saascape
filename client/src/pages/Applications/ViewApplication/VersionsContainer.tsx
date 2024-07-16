import { useEffect, useState } from 'react'
import Versions from './Versions'
import { IApplication } from '../../../store/slices/applicationSlice'
import { useSelector } from 'react-redux'
import { IStore } from '../../../store/store'
import { useParams } from 'react-router-dom'
import breadcrumbs from '../../../helpers/constants/breadcrumbs'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs'
import { IApplicationProps } from '../ApplicationRouteHandler'
import ManageVersionModal from '../../../components/Applications/ManageVersionModal'
import { apiAxiosToast } from '../../../helpers/axios'
import { toast } from 'react-toastify'
import usePaginatedTable from '../../../hooks/usePaginatedTable'
import { Popover, TableColumnProps } from 'antd'
import moment from 'moment'

export interface IVersion {
  _id: string
  namespace: string
  repository: string
  tag: string
  created_at: Date
  updated_at: Date
}
export interface IVersionProps {
  loading: boolean
  selectedApplication: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
  versionColumns: any
  tableConfig: any
  onTableChange: any
  paginatedData: any
  dataFetching: boolean
}

const versionColumns: TableColumnProps<IVersion>[] = [
  {
    title: 'Version',
    key: 'version',
    render: (_, record) => {
      const { namespace, repository, tag } = record
      let text = ''
      namespace && (text += `${namespace}/`)
      repository && (text += `${repository}:`)
      tag && (text += tag)
      return text
    },
  },
  {
    title: 'Namespace',
    dataIndex: 'namespace',
    key: 'namespace',
  },
  {
    title: 'Repository',
    dataIndex: 'repository',
    key: 'repository',
  },
  {
    title: 'Tag',
    dataIndex: 'tag',
    key: 'tag',
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (_, record) => (
      <Popover content={<span>{moment(record?.created_at).format('LLL')}</span>}>
        {moment(record.created_at).fromNow()}
      </Popover>
    ),
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
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    align: 'right',
  },
]

const VersionsContainer = (props: IApplicationProps) => {
  const [loading, setLoading] = useState(false)
  const { selectedApplication } = useSelector((state: IStore) => state.applications)
  const [showManageVersionModal, setShowManageVersionModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()

  const apiUrl = `/applications/${id}/versions`

  const { tableConfig, paginatedData, onSearch, dataFetching, reload, onTableChange } = usePaginatedTable({
    apiUrl,
    sortField: 'updated_at',
  })

  useEffect(() => {
    props.setId(id)
    reload()
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(breadcrumbs.VIEW_APPLICATION_VERSIONS(selectedApplication?.application_name || id, id))
  }, [selectedApplication])

  const openManageVersionModal = () => {
    setShowManageVersionModal(true)
  }
  const onManageVersionClose = () => {
    setShowManageVersionModal(false)
  }

  const onCreateVersion = async (values: any) => {
    setSaving(true)
    const toastSaving = toast.info('Creating version...', {
      isLoading: true,
    })
    const { data } = await apiAxiosToast(toastSaving)?.post(`/applications/${id}/versions`, values)
    if (data?.success) {
      toast.update(toastSaving, {
        isLoading: false,
        type: 'success',
        render: 'Version created successfully',
        autoClose: 2000,
      })
      onManageVersionClose()
      reload()
    }
    setSaving(false)
  }

  const versionProps: IVersionProps = {
    loading,
    selectedApplication,
    versionColumns,
    tableConfig,
    paginatedData,
    onTableChange,
    dataFetching,
    functions: {
      openManageVersionModal,
      onSearch,
    },
  }

  /* 
     
    What to do here?

    Versions can be manually added with reference to the docker image and then instances can use that version, we will need to run validation on the version by pulling the image, so Docker must be configured. But if docker hub is configured, then versions will be added automatically via the docker hub webhooks and api.

  */

  return (
    <>
      <Versions {...versionProps} />
      <ManageVersionModal
        open={showManageVersionModal}
        onManageVersionClose={onManageVersionClose}
        onCreateVersion={onCreateVersion}
        saving={saving}
      />
    </>
  )
}

export default VersionsContainer
