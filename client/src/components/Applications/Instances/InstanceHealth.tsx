/*
 * Copyright SaaScape (c) 2024.
 */

import { instanceHealth } from 'types/enums.ts'
import { Popover } from 'antd'
import Icon from '../../Icon.tsx'
import { IInstanceHealth } from 'types/schemas/Instances.ts'

interface IProps {
  instanceHealthObj: IInstanceHealth
}

const InstanceHealth = ({ instanceHealthObj }: IProps) => {
  const renderInstanceHealth = () => {
    const replicaRender = Object.entries(instanceHealthObj?.replica_health || {}).map(([replica, obj]) => {
      return (
        <div key={replica}>
          <p>
            {replica}: {obj?.health}
          </p>
        </div>
      )
    })

    const popoverContent = (
      <div>
        <p>Instance Health</p>
        <p>Service Status: {instanceHealthObj?.instanceServiceStatus}</p>
        <p>Service Health: {instanceHealthObj?.health}</p>
        <br />
        <p>Replica Health</p>
        {replicaRender}
      </div>
    )

    const healthConfigMap = {
      [instanceHealth.HEALTHY]: {
        icon: 'CIRCLE_CHECK',
        className: 'healthy',
      },
      [instanceHealth.UNHEALTHY]: {
        icon: 'CIRCLE_EXCLAMATION',
        className: 'unhealthy',
      },
      [instanceHealth.PARTIALLY_HEALTHY]: {
        icon: 'CIRCLE_INFO',
        className: 'partially-healthy',
      },
      [instanceHealth.UNKNOWN]: {
        icon: 'CIRCLE_EXCLAMATION',
        className: 'unknown',
      },
    }

    const { icon, className } = healthConfigMap?.[instanceHealthObj?.health] || {}

    return (
      <Popover title={popoverContent}>
        {
          <div className={`d-flex align-center instance-health ${className || ''} `}>
            {icon && <Icon icon={icon} />}
            {instanceHealthObj?.health}
          </div>
        }
      </Popover>
    )
  }

  return <div className={'instance-health-container'}>{renderInstanceHealth()}</div>
}

export default InstanceHealth
