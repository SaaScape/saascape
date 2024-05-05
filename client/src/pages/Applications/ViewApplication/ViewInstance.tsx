import { Avatar, Card, Tabs } from "antd"
import StatisticBanner from "../../../components/StatisticBanner"
import { IViewProps, InstanceMenu } from "./ViewInstanceContainer"
import Icon from "../../../components/Icon"
import moment from "moment"
import MenuContainer from "../../../components/MenuContainer"
import MenuIcon from "../../../components/MenuIcon"

const ViewInstance = ({
  instance,
  instanceTabs,
  instanceMenuItems,
}: IViewProps) => {
  return (
    <section className='view-instance p-relative'>
      {/* <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>{instance?.name}</h1>
            <p>Instance configuration</p>
          </div>
          <div className='right'></div>
        </div>
      </div> */}

      <Card className='m-b-20'>
        <div className='instance-details d-flex justify-between align-center'>
          <div className='left d-flex justify-start align-start'>
            <Avatar size={40} icon={<Icon icon='INSTANCE' />} />
            <div>
              <h3>
                <strong>{instance?.name}</strong> | {instance?.version?.tag}
              </h3>
              <span className='weak'>
                Last modified {moment(instance?.updated_at).fromNow()}
              </span>
            </div>
          </div>
          <div className='right'>
            <MenuContainer
              MenuComponent={
                <InstanceMenu instanceMenuItems={instanceMenuItems} />
              }
            >
              <MenuIcon />
            </MenuContainer>
          </div>
        </div>
      </Card>

      {/* 
     
    IF Instance has domain configured then we will update that domains nginx config to point to this 
    instance. If not then instance will only be accessible by port and ip
    
    Do we want to allow users to access the applications at their respective ports directly?

    Need to add custom nginx directives for applications

    Instances can have linked ids to tenants

    Add instance controls, such as stop, start, restart, update version


    Show instance run time

    

     */}

      <Tabs items={instanceTabs} className='instance-nav' />
    </section>
  )
}

export default ViewInstance
