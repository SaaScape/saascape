import { IProps } from "./ConfigurationContainer"
import { Tabs } from "antd"

const Configuration = ({ configTabs }: IProps) => {
  return (
    <section className='view-application-configuration p-relative'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>Configuration</h1>
            <p>Application configuration</p>
          </div>
          <div className='right'></div>
        </div>
      </div>

      <div className='m-t-20'>
        <Tabs items={configTabs} />
      </div>
    </section>
  )
}

export default Configuration
