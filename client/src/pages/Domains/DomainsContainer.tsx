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
import { Popover, TableColumnProps } from "antd"
import { IEncryptedData } from "../../interfaces/interfaces"
import { serverLookupByIp } from "../../helpers/utils"
import RecordLink from "../../components/RecordLink"
import constants from "../../helpers/constants/constants"
import Icon from "../../components/Icon"
import moment from "moment"

export type DomainSSLStatus =
  | "active"
  | "pending_initialization"
  | "initializing"
  | "expiring"
  | "expired"
export interface IDomain {
  _id: string
  domain_name: string
  status: string
  description: string
  linked_servers: { server_id: string; status: string; last_sync: Date }[]
  enable_ssl: boolean
  DNS: {
    a_record: string
    last_updated: Date
  }
  SSL?: {
    status: DomainSSLStatus
    challenge_token?: string
    challenge_auth_key?: string
    certificates?: {
      cert: IEncryptedData
      key: IEncryptedData
      csr: IEncryptedData
    }
    start_date?: Date
    end_date?: Date
  }
  created_at: Date
  updated_at: Date
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

  const columns: TableColumnProps<IDomain>[] = [
    { title: "Domain Name", dataIndex: "domain_name", key: "domain_name" },
    {
      title: "DNS Host",
      key: "dns_host",
      render: (_, record) => {
        // DNS Host will either be a server, load balancer or and ip

        const serverIp = record?.DNS?.a_record
        const server = serverLookupByIp(serverIp)

        if (server?.server_name) {
          return (
            <RecordLink
              entity='server'
              label={server?.server_name}
              link={`/servers/${server?._id}`}
            >
              {server?.server_name}
            </RecordLink>
          )
        }

        return serverIp || "N/A"
      },
    },
    {
      title: "SSL",
      key: "ssl_status",
      render: (_, record) => {
        const sslEnabled = record?.enable_ssl

        const status = record?.SSL?.status

        const colorMap = {
          [constants.SSL_STATUSES.ACTIVE]: "green",
          [constants.SSL_STATUSES.PENDING_INITIALIZATION]: "orange",
          [constants.SSL_STATUSES.INITIALIZING]: "blue",
          [constants.SSL_STATUSES.EXPIRING]: "orange",
          [constants.SSL_STATUSES.EXPIRED]: "red",
          [constants.SSL_STATUSES.FAILED]: "red",
        }

        const secure = [
          constants.SSL_STATUSES.ACTIVE,
          constants.SSL_STATUSES.EXPIRING,
        ].includes(status || "")

        const popoverMessage = {
          [constants.SSL_STATUSES.ACTIVE]: (
            <div>
              Expires On: {moment(record?.SSL?.end_date).format("DD-MM-YYYY")}
            </div>
          ),
          [constants.SSL_STATUSES.EXPIRING]: (
            <div>
              Expires On: {moment(record?.SSL?.end_date).format("DD-MM-YYYY")}
            </div>
          ),
          [constants.SSL_STATUSES.EXPIRED]: (
            <div>
              Expired On: {moment(record?.SSL?.end_date).format("DD-MM-YYYY")}
            </div>
          ),
          [constants.SSL_STATUSES.FAILED]: (
            <div>
              <div>Failed to initialize SSL</div>
              <div>Reason: </div>
            </div>
          ),
        }

        return sslEnabled ? (
          <Popover
            title={`SSL Status: ${status}`}
            content={popoverMessage?.[status || ""]}
          >
            <span style={{ color: colorMap?.[status || ""] }}>
              <Icon icon={secure ? "SECURE" : "INSECURE"} />
            </span>
          </Popover>
        ) : (
          "Not Enabled"
        )
      },
    },
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
