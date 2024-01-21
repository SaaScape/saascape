import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import Contacts from "./Contacts"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import { ILinkedIdEnabledDocument } from "../../interfaces/interfaces"
import { Avatar } from "antd"
import IntegrationsBar from "../../components/Applications/IntegrationsBar"
import constants from "../../helpers/constants/constants"
import { apiAxios } from "../../helpers/axios"
import ManageContactModal from "../../components/Contacts/ManageContactModal"
import { toast } from "react-toastify"

import usePaginatedTable, {
  IPaginatedViewProps,
} from "../../hooks/usePaginatedTable"

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
    [key: string]: string
  }
  status: string
  contact_type: ContactType
  created_at: Date
  updated_at: Date
}
export interface IViewProps extends IPaginatedViewProps {
  loading: boolean
  columns?: any
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const apiUrl = `/contacts`

const ContactsContainer = () => {
  const {
    tableConfig,
    paginatedData,
    onSearch,
    dataFetching,
    reload,
    onTableChange,
  } = usePaginatedTable({ apiUrl })

  const [contact, setContact] = useState<IContact | null>(null)
  const [showManageContactModal, setShowManageContactModal] = useState(false)

  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.CONTACTS)
  }, [])

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

  const onManageContact = (contact: IContact) => {
    setContact(contact || null)
    setShowManageContactModal(true)
  }

  const closeManageContactModal = () => {
    setShowManageContactModal(false)
    setContact(null)
  }

  const onRowClick = (record: IContact) => {
    onManageContact(record)
  }

  const updateContact = async (contactId: string, values: any) => {
    const {
      data: { success },
    } = await apiAxios.put(`/contacts/${contactId}`, values)
    if (success) {
      toast.success("Contact updated successfully")
      reload()
      closeManageContactModal()
    }
  }

  const createContact = async (values: any) => {
    const {
      data: { success },
    } = await apiAxios.post(`/contacts`, values)
    if (success) {
      toast.success("Contact created successfully")
      reload()
      closeManageContactModal()
    }
  }

  const onContactSave = (values: any) => {
    if (contact?._id) {
      updateContact(contact?._id, values)
    } else {
      createContact(values)
    }
  }

  const viewProps: IViewProps = {
    paginatedData,
    loading: dataFetching,
    columns,
    tableConfig,
    onTableChange,
    functions: {
      onSearch,
      onManageContact,
      onRow: (record) => {
        return {
          onClick: () => {
            onRowClick(record)
          },
        }
      },
    },
  }

  const ManageContactModalProps = {
    open: showManageContactModal,
    onCancel: closeManageContactModal,
    contact,
    onSave: onContactSave,
  }
  return (
    <>
      <Contacts {...viewProps} />
      <ManageContactModal {...ManageContactModalProps} />
    </>
  )
}

export default ContactsContainer
