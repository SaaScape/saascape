import { Card, Switch } from "antd"
import {
  IIntegrationSettingItem,
  ISettingItem,
  IViewProps,
} from "./ViewSettingsContainer"
import Icon from "../../components/Icon"
import { Link } from "react-router-dom"

const ViewSettings = (props: IViewProps) => {
  const { settingItems, integrationSettingItems } = props
  return (
    <section className='view-settings'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div className='d-flex align-center'>
            <div>
              <h1>Settings</h1>
              <p>View and managed SaaScape configuration</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Card title='Configuration' className='m-b-20'>
          <div className='settings-grid'>
            {settingItems?.map((item) => (
              <SettingComponent key={item.key} item={item} />
            ))}
          </div>
        </Card>
        <Card title='Integrations'>
          <div className='settings-grid'>
            {integrationSettingItems?.map((item) => (
              <IntegrationComponent key={item.key} item={item} />
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

interface ISettingProps {
  item: ISettingItem
}
const SettingComponent = (props: ISettingProps) => {
  const { item } = props
  return (
    <div className='custom-component setting-component '>
      <Link to={item.path} className='d-flex justify-start align-start'>
        <div className='icon-container d-flex justify-center align-center'>
          <Icon icon={item.icon} style={item.iconStyle} />
        </div>
        <div className='info-container'>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      </Link>
    </div>
  )
}

interface IIntegrationSettingProps {
  item: IIntegrationSettingItem
}
const IntegrationComponent = (props: IIntegrationSettingProps) => {
  const { item } = props
  return (
    <div className='custom-component setting-component '>
      <Link to={item.path} className='d-flex justify-start align-start'>
        <div className='icon-container d-flex justify-center align-center'>
          <Icon icon={item.icon} style={item.iconStyle} />
        </div>
        <div className='info-container'>
          <div className='d-flex justify-between'>
            <h3>{item.name}</h3>
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Switch checked={item.value} size='small' />
            </div>
          </div>
          <p>{item.description}</p>
        </div>
      </Link>
    </div>
  )
}

export default ViewSettings
