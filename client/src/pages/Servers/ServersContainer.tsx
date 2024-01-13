import Servers from "./Servers"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import { useEffect, useState } from "react"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import ManageServerModal from "../../components/Servers/ManageServerModal"
import { apiAxios } from "../../helpers/axios"
import { FormInstance } from "antd"
import { toast } from "react-toastify"

export interface IViewProps {
  loading: boolean
  columns?: any[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ServersContainer = () => {
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showServerModal, setShowServerModal] = useState(false)

  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.SERVERS)
  }, [])

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
  ]

  const onManageServer = () => {
    setShowServerModal(true)
  }

  const getServers = async () => {}
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
