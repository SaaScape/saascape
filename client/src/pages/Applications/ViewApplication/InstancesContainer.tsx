import { useEffect, useState } from 'react'
import Instances from './Instances'
import { IApplicationProps } from '../ApplicationRouteHandler'
import { useNavigate, useParams } from 'react-router-dom'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs'
import breadcrumbs from '../../../helpers/constants/breadcrumbs'
import { IStore } from '../../../store/store'
import { useDispatch, useSelector } from 'react-redux'
import { IApplication } from '../../../store/slices/applicationSlice'
import { Spin, TableColumnProps } from 'antd'
import { apiAxios, apiAxiosToast } from '../../../helpers/axios'
import { toast } from 'react-toastify'
import IInstance from 'types/schemas/Instances'
import { bulkUpdateInstanceHealth } from '../../../store/slices/instancesSlice.ts'

export interface IProps {
  selectedApplication: IApplication | null
  loading: boolean
  columns: TableColumnProps<IInstance>[]
  instances: IInstance[]
  instancesInfo: { [key: string]: any; totalInstances: number }
  showCreateInstanceModal: boolean
  closeCreateInstanceModal: () => void
  openCreateInstanceModal: () => void
  onInstanceCreate: (values: any) => void
  onRow: (record: IInstance) => any
}

const InstancesContainer = (props: IApplicationProps) => {
  const [instances, setInstances] = useState<IInstance[]>([])
  const [instancesInfo, setInstancesInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [healthLoading, setHealthLoading] = useState(false)
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false)
  const { selectedApplication } = useSelector((state: IStore) => state.applications)
  const instanceHealths = useSelector((state: IStore) => state.instances?.instanceHealths)

  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    props.setId(id)
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(breadcrumbs.VIEW_APPLICATION_INSTANCES(selectedApplication?.application_name || id, id))
  }, [selectedApplication])

  useEffect(() => {
    getInstancesData()
    getInstances()
    getInstancesHealth()
  }, [selectedApplication?._id])

  const columns: TableColumnProps<IInstance>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Health',
      key: 'health',
      render: (_, record) => {
        if (healthLoading) return <Spin />
        const instanceHealth = instanceHealths?.[record?._id?.toString()]
        return instanceHealth?.health
      },
    },
    {
      title: 'Status',
      key: 'service_status',
      render: (_, record) => {
        if (healthLoading) return <Spin />
        const instanceHealth = instanceHealths?.[record?._id?.toString()]
        return instanceHealth?.instanceServiceStatus
      },
    },
    {
      title: 'Version',
      key: 'version',
      render: (_, record) => {
        return record?.version?.tag
      },
    },
  ]

  const getInstancesData = async () => {
    if (!selectedApplication?._id) return
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${selectedApplication?._id}/instances/instancesInfo`)
    if (success) {
      setInstancesInfo(data?.instancesData)
    }
    setLoading(false)
  }

  const getInstancesHealth = async () => {
    if (!selectedApplication?._id) return
    setHealthLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/instances/instancesHealth`)
    if (success) {
      dispatch(bulkUpdateInstanceHealth(data?.instanceHealths))
    }
    setHealthLoading(false)
  }

  const getInstances = async () => {
    if (!selectedApplication?._id) return
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${selectedApplication?._id}/instances`)
    if (success) {
      setInstances(data?.instances)
    }
    setLoading(false)
  }

  const closeCreateInstanceModal = () => {
    setShowCreateInstanceModal(false)
  }
  const openCreateInstanceModal = () => {
    setShowCreateInstanceModal(true)
  }

  const onInstanceCreate = async (values: any) => {
    setLoading(true)
    const toastId = toast.loading(`Creating instance ${values.name}...`)
    const {
      data: { success, data },
    } = await apiAxiosToast(toastId).post(`/applications/${selectedApplication?._id}/instances`, values)
    if (success) {
      setShowCreateInstanceModal(false)
      toast.update(toastId, {
        type: 'success',
        render: `Instance ${values.name} created successfully`,
        isLoading: false,
        autoClose: 3000,
      })
    }
    setLoading(false)
    navigate(`/applications/${selectedApplication?._id}/instances/${data?._id}`)
  }

  const onRow = (record: IInstance) => {
    return {
      onClick: () => navigate(`/applications/${selectedApplication?._id}/instances/${record?._id}`),
    }
  }

  const instanceProps: IProps = {
    selectedApplication,
    loading,
    columns,
    instances,
    instancesInfo,
    showCreateInstanceModal,
    closeCreateInstanceModal,
    openCreateInstanceModal,
    onInstanceCreate,
    onRow,
  }

  return <Instances {...instanceProps} />
}

export default InstancesContainer
