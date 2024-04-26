import { useEffect, useState } from "react"
import Instances from "./Instances"
import { IApplicationProps } from "../ApplicationRouteHandler"
import { useNavigate, useParams } from "react-router-dom"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { IStore } from "../../../store/store"
import { useSelector } from "react-redux"
import {
  IApplication,
  IEnvironmentVariablesConfig,
  ISecretsConfig,
} from "../../../store/slices/applicationSlice"
import { TableColumnProps } from "antd"
import { apiAxios, apiAxiosToast } from "../../../helpers/axios"
import { IVersion } from "./VersionsContainer"
import { toast } from "react-toastify"

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

export type serviceStatus =
  | "running" // Instance is running
  | "stopped" // Instance has stopped
  | "failed" // Instance has failed
  | "creating" // New instance has been picked up by queue and is being created
  | "pending" // After creating a new instance after fully configured
  | "pre-configured" // when creating a new instance before fully configured
  | "creation-failed" // when creating a new instance failed
  | "creation-success"

export interface IInstance {
  _id: string
  service_status: serviceStatus
  name: string
  is_custom_database: boolean
  database: string | string
  config: {
    environment_variables: IEnvironmentVariablesConfig
    secrets_config: ISecretsConfig
  }
  version_id: string
  version?: IVersion
  application_id: string
  status: string
  swarm_id: string
  created_at: Date
  updated_at: Date
}

const columns: TableColumnProps<IInstance>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Status",
    dataIndex: "service_status",
    key: "service_status",
  },
  {
    title: "Version",
    key: "version",
    render: (_, record) => {
      return record?.version?.tag
    },
  },
]

const InstancesContainer = (props: IApplicationProps) => {
  const [instances, setInstances] = useState<IInstance[]>([])
  const [instancesInfo, setInstancesInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false)
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )

  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()

  useEffect(() => {
    props.setId(id)
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_INSTANCES(
        selectedApplication?.application_name || id,
        id
      )
    )
  }, [selectedApplication])

  useEffect(() => {
    getInstancesData()
    getInstances()
  }, [selectedApplication?._id])

  const getInstancesData = async () => {
    if (!selectedApplication?._id) return
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(
      `/applications/${selectedApplication?._id}/instances/instancesInfo`
    )
    if (success) {
      setInstancesInfo(data?.instancesData)
    }
    setLoading(false)
  }

  const getInstances = async () => {
    if (!selectedApplication?._id) return
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(
      `/applications/${selectedApplication?._id}/instances`
    )
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
    } = await apiAxiosToast(toastId).post(
      `/applications/${selectedApplication?._id}/instances`,
      values
    )
    if (success) {
      setShowCreateInstanceModal(false)
      console.log(data)
      toast.update(toastId, {
        type: "success",
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
      onClick: () =>
        navigate(
          `/applications/${selectedApplication?._id}/instances/${record?._id}`
        ),
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
