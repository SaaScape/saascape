import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import Domains from "./Domains"
import usePaginatedTable, {
  IPaginatedViewProps,
} from "../../hooks/usePaginatedTable"
import ManageDomainModal from "../../components/Domains/ManageDomainModal"
import { apiAxios } from "../../helpers/axios"
import { toast } from "react-toastify"

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

  const [showManageDomainModal, setShowManageDomainModal] = useState(false)
  const [domain, setDomain] = useState<IDomain | null>(null)
  const [loading, setLoading] = useState(false)

  // TODODODODODO
  // When showing domnains in table, show where it resolves to ip address and if ip is one of our serversm we will set it to the server name and a record link. If not we will issue a warning
  // Domain ssl will be controlled by SaaScape, a file will be added to each servers domain directory. Allowing for file based auth to be implemented

  const onDomainSave = async (values: any) => {
    console.log(values)
    setLoading(true)
    if (domain?._id) {
      const response = await apiAxios.put(`/domains/${domain?._id}`, values)
    } else {
      const {
        data: { success, data },
      } = await apiAxios.post(`/domains`, values)
      if (success) {
        setShowManageDomainModal(false)
        toast.success("Domain created successfully")
        reload()
      }
      setLoading(false)
      console.log(data)
    }
  }

  const onAddDomainClick = () => {
    setDomain(null)
    setShowManageDomainModal(true)
  }

  const onEditDomainClick = (domain: IDomain) => {
    setDomain(domain)
    setShowManageDomainModal(true)
  }

  const onModalCancel = () => {
    setDomain(null)
    setShowManageDomainModal(false)
  }

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
      onAddDomainClick,
    },
  }

  const manageDomainModalProps = {
    open: showManageDomainModal,
    onCancel: onModalCancel,
    onSubmit: onDomainSave,
    domain,
    loading,
  }

  return (
    <>
      <Domains {...viewProps} />
      <ManageDomainModal {...manageDomainModalProps} />
    </>
  )
}
