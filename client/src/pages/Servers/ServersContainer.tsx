import Servers from "./Servers"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import { useEffect, useState } from "react"
import breadcrumbs from "../../helpers/constants/breadcrumbs"

export interface IViewProps {
  loading: boolean
  columns?: any[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ServersContainer = () => {
  const [loading, setLoading] = useState(false)

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

  const viewProps: IViewProps = {
    loading,
    columns,
  }

  return <Servers {...viewProps} />
}

export default ServersContainer
