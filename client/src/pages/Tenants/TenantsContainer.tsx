import { useEffect } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import Tenants from "./Tenants"
import breadcrumbs from "../../helpers/constants/breadcrumbs"

export interface IProps {
  columns: any[]
  loading: boolean
  tenants: any[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
]

const TenantsContainer = () => {
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.TENANTS)
  }, [])

  const tenantProps: IProps = {
    columns,
    loading: false,
    tenants: [],
  }
  return <Tenants {...tenantProps} />
}

export default TenantsContainer
