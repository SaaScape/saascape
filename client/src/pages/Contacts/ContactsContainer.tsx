import { useEffect, useRef, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import Contacts from "./Contacts"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import { ILinkedIdEnabledDocument } from "../../interfaces/interfaces"
import { Avatar } from "antd"
import IntegrationsBar from "../../components/Applications/IntegrationsBar"
import constants from "../../helpers/constants/constants"
import { apiAxios } from "../../helpers/axios"
import { queryParamBuilder } from "../../helpers/utils"

export type ContactType = "tenant" | "lead"

export interface IContact extends ILinkedIdEnabledDocument {
  _id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: {
    line1: string
    line2: string
    line3: string
    city: string
    state: string
    postcode: string
    country: string
  }
  status: string
  contact_type: ContactType
  created_at: Date
  updated_at: Date
}
export interface IViewProps {
  paginatedContacts: IPaginatedContacts
  loading: boolean
  columns?: any
  tableConfig: ITableConfig
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

export interface ITableConfig {
  current: number
  pageSize: number
}

interface IPaginatedContacts {
  totalDocuments: number
  records: {
    [pageNumber: number]: IContact[]
  }
}

const ContactsContainer = () => {
  const [loading, setLoading] = useState(false)
  const [tableConfig, setTableConfig] = useState<ITableConfig>({
    current: 1,
    pageSize: 10,
  })
  const [queryConfig, setQueryConfig] = useState({
    searchValue: "",
  })
  const [paginatedContacts, setPaginatedContacts] =
    useState<IPaginatedContacts>({
      totalDocuments: 0,
      records: {},
    })

  const setBreadcrumbs = useSetBreadcrumbs()

  const prevTableConfigRef = useRef<ITableConfig>()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.CONTACTS)
  }, [])

  useEffect(() => {
    return () => {
      prevTableConfigRef.current = tableConfig
    }
  }, [tableConfig])

  useEffect(() => {
    ;(() => {
      const records = paginatedContacts?.records?.[tableConfig?.current]?.length
      if (
        prevTableConfigRef.current?.current !== tableConfig?.current &&
        !records
      )
        return getContacts(queryConfig?.searchValue)

      if (prevTableConfigRef.current?.pageSize !== tableConfig?.pageSize) {
        setPaginatedContacts((curr) => ({
          ...curr,
          records: {},
        }))
        return getContacts(queryConfig?.searchValue)
      }
    })()
  }, [tableConfig])

  const columns = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "name",
      render: (text: any, record: IContact) => {
        const abbreviation = `${record?.first_name} ${record?.last_name}`
          ?.split(" ")
          .map((t) => t[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()

        return (
          <div className='d-flex align-center'>
            <Avatar className='m-r-10' shape='square' size='large'>
              {abbreviation}
            </Avatar>
            <div className='contact-name-container'>
              <span className='contact-name'>
                {`${record?.first_name} ${record?.last_name}`}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      title: "Type",
      dataIndex: "contact_type",
      key: "type",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Country",
      dataIndex: "address.country",
      key: "country",
      render: (_: any, record: IContact) => {
        return record?.address?.country
      },
    },
    {
      title: "",
      dataIndex: "",
      key: "action",
      align: "right",
      render: (_: any, record: IContact) => {
        return (
          <IntegrationsBar
            linkedIds={record?.linked_ids || []}
            type='transparent'
            supportedIntegrations={[constants.INTEGRATIONS.STRIPE]}
          />
        )
      },
    },
  ]
  const getContacts = async (value: string) => {
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(
      `/contacts${queryParamBuilder({
        page: tableConfig?.current,
        limit: tableConfig?.pageSize,
        searchValue: value,
      })}`
    )
    if (success) {
      setPaginatedContacts((curr) => ({
        totalDocuments: +data?.contacts?.documentCount,
        records: {
          ...(curr?.records || {}),
          [+data?.contacts?.paginatedData?.page]:
            data?.contacts?.paginatedData?.records,
        },
      }))
    }
    setLoading(false)
  }

  const onTableChange = (config: any) => {
    setTableConfig(config)
  }

  const onSearch = (value: string) => {
    setQueryConfig({ searchValue: value })
    getContacts(value)
  }

  const viewProps: IViewProps = {
    paginatedContacts,
    loading,
    columns,
    tableConfig,
    functions: {
      onTableChange,
      onSearch,
    },
  }
  return <Contacts {...viewProps} />
}

export default ContactsContainer
