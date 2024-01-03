import { Tabs } from "antd"
import { IProps } from "./ViewApplicationContainer"

const ViewApplication = (props: IProps) => {
  return (
    <section className='view-application'>
      <Tabs className='view-application-tabs' items={props.tabItems} />
    </section>
  )
}

export default ViewApplication
