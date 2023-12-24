import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import Applications from "./Applications"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import { apiAxios } from "../../helpers/axios"
import { Avatar } from "antd"
import { useNavigate } from "react-router-dom"

export interface IApplication {
  application_name: string
  created_at: Date
  updated_at: Date
  _id: string
  description: string
}
export interface IProps {
  columns: any[]
  loading: boolean
  applications: IApplication[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const columns = [
  {
    title: "Name",
    dataIndex: "application_name",
    key: "application_name",
    render: (text: any, record: IApplication) => {
      const abbreviation = record?.application_name
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
          <div className='application-name-container'>
            <span className='application-name'> {text}</span>
            <p className='application-description'>{record?.description}</p>
          </div>
        </div>
      )
    },
  },
]

const ApplicationsContainer = () => {
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<IApplication[]>([])
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()
  useEffect(() => {
    setBreadcrumbs(breadcrumbs.APPLICATIONS)
  }, [])

  useEffect(() => {
    getApplications()
  }, [])

  const getApplications = async () => {
    setLoading(true)
    const { data } = await apiAxios.get(`/applications`)
    console.log(data)

    if (data?.success) {
      setApplications(data?.data?.applications)
    }
    setLoading(false)
  }

  const onRow = (record: IApplication) => ({
    onClick: () => navigate(`/applications/${record?._id}`),
  })

  const viewProps: IProps = {
    columns,
    loading,
    functions: {
      getApplications,
      onRow,
    },
    applications,
  }

  return <Applications {...viewProps} />
}

export default ApplicationsContainer
