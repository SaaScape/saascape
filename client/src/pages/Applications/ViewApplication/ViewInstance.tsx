import StatisticBanner from "../../../components/StatisticBanner"
import { IViewProps } from "./ViewInstanceContainer"

const ViewInstance = ({ instance }: IViewProps) => {
  return (
    <section className='view-instance p-relative'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>{instance?.name}</h1>
            <p>Instance configuration</p>
          </div>
          <div className='right'></div>
        </div>
      </div>

      <StatisticBanner loading={false}>
        <div>
          <div className='title'>Replicas</div>
          <div className='value'>{1}</div>
        </div>
        <div>
          <div>
            <div className='title'>CPU Usage</div>
            <div className='value'>{`22%`}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Memory</div>
            <div className='value'>{"424 Mb"}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Version</div>
            <div className='value'>{instance?.version?.tag}</div>
          </div>
        </div>
      </StatisticBanner>

      {/* 
     
    IF Instance has domain configured then we will update that domains nginx config to point to this 
    instance. If not then instance will only be accessible by port and ip
    
    Do we want to allow users to access the applications at their respective ports directly?

    Need to add custom nginx directives for applications

    Instances can have linked ids to tenants

    Add instance controls, such as stop, start, restart, update version


    Show instance run time

    

     */}
    </section>
  )
}

export default ViewInstance
