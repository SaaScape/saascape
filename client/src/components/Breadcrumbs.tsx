import { Link, useNavigate } from 'react-router-dom'
import { IBreadcrumbs } from '../store/slices/breadcrumbs'
import { Select } from 'antd'
import { useSelector } from 'react-redux'
import { IStore } from '../store/store'
import { useEffect, useRef, useState } from 'react'

interface IProps {
  breadcrumbs: IBreadcrumbs[]
}

const Breadcrumbs = (props: IProps) => {
  const { selectedApplication, applications } = useSelector((state: IStore) => state.applications)
  const [showApplicationSelect, setShowApplicationSelect] = useState(false)
  const applicationSelectRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (!showApplicationSelect) return
    const event = (e: Event) => {
      if (applicationSelectRef?.current?.contains(e.target as Node)) return
      setShowApplicationSelect(false)
    }
    document.addEventListener('click', event)
    return () => {
      document.removeEventListener('click', event)
    }
  }, [showApplicationSelect])

  const onApplicationClick = () => {
    setShowApplicationSelect((curr) => !curr)
  }

  const onApplicationChange = (value: string) => {
    const path = props?.breadcrumbs?.[props?.breadcrumbs?.length - 1]?.path
    const newPath = path?.split('/')
    newPath[2] = value
    navigate(newPath.join('/'))
    setShowApplicationSelect(false)
  }

  return (
    <div className="custom-breadcrumbs">
      <ul>
        {props?.breadcrumbs?.map((breadcrumb, index) => {
          let renderItem
          switch (breadcrumb?.type) {
            case 'application_select':
              renderItem = (
                <li key={index} className="breadcrumb-item d-flex align-center">
                  {showApplicationSelect ? (
                    <div ref={applicationSelectRef}>
                      <Select
                        bordered={false}
                        style={{ width: 150 }}
                        defaultValue={selectedApplication?._id?.toString()}
                        onChange={onApplicationChange}
                        open={showApplicationSelect}
                        showSearch
                        options={applications?.map((application) => ({
                          value: application?._id,
                          label: application?.application_name,
                        }))}
                        filterOption={(input, option) => {
                          return option?.label?.toLowerCase()?.includes(input) || false
                        }}
                      />
                    </div>
                  ) : (
                    <Link
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        onApplicationClick()
                      }}
                      to={breadcrumb?.path}
                    >
                      {breadcrumb.title}
                    </Link>
                  )}
                </li>
              )
              break
            default:
              renderItem = (
                <li key={index} className="breadcrumb-item">
                  <Link to={breadcrumb?.path}>{breadcrumb.title}</Link>
                </li>
              )
          }

          return renderItem
        })}
      </ul>
    </div>
  )
}

export default Breadcrumbs
