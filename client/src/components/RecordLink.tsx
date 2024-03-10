import { Tooltip } from "antd"
import Icon from "./Icon"
import { Link } from "react-router-dom"

interface IProps {
  entity: string
  label: string
  link: string
  children: React.ReactNode
}

const RecordLink = (props: IProps) => {
  const { entity, label, link } = props

  const title = `Open ${entity} in new tab`
  return (
    <div className='record-link d-flex'>
      <div className='d-flex'>
        <span className='m-r-20'>
          <Link to={link}>{label}</Link>
        </span>
        <Tooltip title={title}>
          <span>
            <Link to={link} target='_blank'>
              <Icon icon='NEW_TAB' />
            </Link>
          </span>
        </Tooltip>
      </div>
    </div>
  )
}

export default RecordLink
