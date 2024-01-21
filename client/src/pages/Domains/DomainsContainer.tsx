import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import Domains from "./Domains"
import usePaginatedTable, {
  IPaginatedViewProps,
} from "../../hooks/usePaginatedTable"

export interface IDomain {
  _id: string
  domain_name: string
}
export interface IViewProps extends IPaginatedViewProps {
  loading: boolean
  columns: any[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const apiUrl = `/domains`

export const DomainsContainer = () => {
  const {
    tableConfig,
    paginatedData,
    onSearch,
    dataFetching,
    reload,
    onTableChange,
  } = usePaginatedTable({ apiUrl })

  const setBreadcrumbs = useSetBreadcrumbs()
  useEffect(() => {
    setBreadcrumbs(breadcrumbs.DOMAINS)
  }, [])

  // TODODODODODO
  // When showing domnains in table, show where it resolves to ip address and if ip is one of our serversm we will set it to the server name and a record link. If not we will issue a warning
  // Domain ssl will be controlled by SaaScape, a file will be added to each servers domain directory. Allowing for file based auth to be implemented

  const columns = [
    { title: "Domain Name", dataIndex: "domain_name", key: "domain_name" },
  ]

  const viewProps: IViewProps = {
    loading: dataFetching,
    columns,
    paginatedData,
    tableConfig,
    onTableChange,
    functions: {
      onSearch,
    },
  }

  return <Domains {...viewProps} />
}
