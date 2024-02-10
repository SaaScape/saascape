import { Button } from "antd"
import IntegrationsBar from "../../components/Applications/IntegrationsBar"
import { IViewProps } from "./ViewServerContainer"
import StatisticBanner from "../../components/StatisticBanner"
import constants from "../../helpers/constants/constants"

const ViewServer = (props: IViewProps) => {
  console.log(props.server)
  console.log(props.loading)
  return (
    <section className='sub-section view-plan'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div className='d-flex align-center'>
            <div>
              <h1>{props?.server?.server_name || "Loading..."}</h1>
              <p>View and managed server</p>
            </div>
            <div>
              <IntegrationsBar
                supportedIntegrations={[constants.INTEGRATIONS.DOCKER]}
                linkedIds={props?.server?.linked_ids || []}
              />
            </div>
          </div>
          <div className='right'></div>
        </div>
      </div>

      <StatisticBanner className='m-b-20' loading={props?.loading}>
        <div>
          <div className='title'>Server</div>
          <div className='value'>{props?.server?.server_name}</div>
        </div>
        <div>
          <div className='title'>Private IP</div>
          <div className='value'>10.1.1.1</div>
        </div>
        <div>
          <div className='title'>Public IP</div>
          <div className='value'>{props?.server?.server_ip_address}</div>
        </div>
        <div>
          <div className='title'>Availability</div>
          <div className='value'>{props.server?.availability}</div>
        </div>
      </StatisticBanner>
    </section>
  )
}

export default ViewServer
