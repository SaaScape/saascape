import { Tabs } from "antd"
import { IProps } from "./ViewApplicationContainer"

const ViewApplication = (props: IProps) => {
  return (
    <section className='view-application p-relative'>
      <div className='top-bar-container'>
        <Tabs
          className='view-application-tabs'
          items={props.tabItems}
          tabBarStyle={{ borderBottom: "none" }}
          destroyInactiveTabPane
        />
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>{props.topBarConfig?.title}</h1>
            <p>{props.topBarConfig?.description}</p>
          </div>
          <div className='right'>{props.topBarConfig?.right}</div>
        </div>
      </div>
    </section>
  )
}

export default ViewApplication
