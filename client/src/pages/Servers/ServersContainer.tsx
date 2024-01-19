import Servers from "./Servers"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import { useEffect, useState } from "react"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import ManageServerModal from "../../components/Servers/ManageServerModal"
import { apiAxios } from "../../helpers/axios"
import { FormInstance, Tag } from "antd"
import { toast } from "react-toastify"
import { IEncryptedData } from "../../interfaces/interfaces"
import constants from "../../helpers/constants/constants"

export interface IServer {
  _id: string
  server_ip_address: string
  ssh_port: number
  admin_username: IEncryptedData
  private_key: IEncryptedData
  server_name: string
  status: string
  server_status: string
}
export interface IViewProps {
  loading: boolean
  columns?: any[]
  servers?: IServer[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ServersContainer = () => {
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showServerModal, setShowServerModal] = useState(false)
  const [servers, setServers] = useState([])

  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.SERVERS)
  }, [])

  useEffect(() => {
    getServers()
  }, [])

  const columns = [
    {
      title: "Server Name",
      dataIndex: "server_name",
      key: "server_name",
    },
    {
      title: "Server IP Address",
      dataIndex: "server_ip_address",
      key: "server_ip_address",
    },
    {
      title: "Status",
      dataIndex: "server_status",
      key: "server_status",
      render: (text: string) => {
        switch (text) {
          case constants.SERVER_STATUSES.PENDING_INITIALIZATION:
            return <Tag color='orange'>Pending Initialization</Tag>
          case constants.SERVER_STATUSES.FAILED_INITIALIZATION:
            return <Tag color='red'>Failed Initialization</Tag>
          case constants.SERVER_STATUSES.SUCCESSFUL_INITIALIZATION:
            return <Tag color='green'>Ready</Tag>
          default:
            return text
        }
      },
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      render: (text: string) => {
        switch (text) {
          case constants.AVAILABILITY.ONLINE:
            return <Tag color='green'>{constants.AVAILABILITY.ONLINE}</Tag>
          case constants.AVAILABILITY.OFFLINE:
            return <Tag color='red'>{constants.AVAILABILITY.OFFLINE}</Tag>

          default:
            return text
        }
      },
    },
  ]

  const onManageServer = () => {
    setShowServerModal(true)
  }

  const getServers = async () => {
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get("/servers")
    if (success) {
      setServers(data?.servers)
    }
    setLoading(false)
  }
  const testConnection = async (values: any, form: FormInstance) => {
    setTestingConnection(true)
    const { data } = await apiAxios.post("/servers/test-connection", values)
    if (data?.success && data?.data?.success) {
      toast.success("Connection successful")
      setTestingConnection(false)
      return true
    }
    const { error } = data?.data?.data || {}
    switch (error) {
      case "Missing required params":
        const missingParams = data?.data?.data?.missingParams
        const errorFieldObj = (missingParams || []).map((param: string) => ({
          name: [param],
          errors: ["Required"],
        }))
        form.setFields(errorFieldObj)
        toast.error("Connection test failed: " + missingParams.join(", "))
        break
    }

    setTestingConnection(false)
  }
  const onSave = async (values: any, form: FormInstance) => {
    setLoading(true)
    const connectionTestResult = await testConnection(values, form)
    if (!connectionTestResult) return // Do somethign here re error
    const {
      data: { success },
    } = await apiAxios.post("/servers", values)
    if (success) {
      toast.success("Server created successfully")
      await getServers()
      setShowServerModal(false)
    }

    setLoading(false)
  }

  const viewProps: IViewProps = {
    loading,
    columns,
    servers: servers,
    functions: {
      onManageServer,
    },
  }

  const manageServerProps = {
    onCancel: () => {
      setShowServerModal(false)
    },
    testConnection,
    open: showServerModal,
    onSave,
    loading: loading || testingConnection,
  }

  return (
    <>
      <Servers {...viewProps} />
      <ManageServerModal {...manageServerProps} />
    </>
  )
}

export default ServersContainer
