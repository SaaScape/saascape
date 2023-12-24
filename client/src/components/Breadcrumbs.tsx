import { Link } from "react-router-dom"
import { IBreadcrumbs } from "../store/slices/breadcrumbs"

interface IProps {
  breadcrumbs: IBreadcrumbs[]
}

const Breadcrumbs = (props: IProps) => {
  return (
    <div className='custom-breadcrumbs'>
      <ul>
        {props?.breadcrumbs?.map((breadcrumb, index) => (
          <li key={index} className='breadcrumb-item'>
            <Link to={breadcrumb?.path}>{breadcrumb.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Breadcrumbs
