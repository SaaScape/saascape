import { Link } from "react-router-dom"
import { IBreadcrumbs } from "../store/slices/breadcrumbs"
import { Select } from "antd"
import { useSelector } from "react-redux"
import { IStore } from "../store/store"

interface IProps {
  breadcrumbs: IBreadcrumbs[]
}

const Breadcrumbs = (props: IProps) => {
  const { selectedApplication, applications } = useSelector(
    (state: IStore) => state.applications
  )

  return (
    <div className='custom-breadcrumbs'>
      <ul>
        {props?.breadcrumbs?.map((breadcrumb, index) => {
          let renderItem
          switch (breadcrumb?.type) {
            case "application_select":
              renderItem = (
                <li key={index} className='breadcrumb-item'>
                  <Select>
                    {applications?.map((application) => (
                      <Select.Option
                        value={application?._id}
                        key={application?._id}
                      >
                        {application?.application_name}
                      </Select.Option>
                    ))}
                  </Select>
                  {/* <Link to={breadcrumb?.path}>{breadcrumb.title}</Link> */}
                </li>
              )
              break
            default:
              renderItem = (
                <li key={index} className='breadcrumb-item'>
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
