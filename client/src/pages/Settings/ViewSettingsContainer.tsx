import { ReactElement, useEffect } from 'react'
import useSetBreadcrumbs from '../../middleware/useSetBreadcrumbs'
import ViewSettings from './ViewSettings'
import breadcrumbs from '../../helpers/constants/breadcrumbs'
import { IconStyles } from '../../components/Icon'
import { useSelector } from 'react-redux'
import { IStore } from '../../store/store'
import constants from '../../helpers/constants/constants'

export interface ISettingItem {
  key: number
  icon: string
  iconStyle: IconStyles
  name: string
  description: string
  path: string
}

export interface IIntegrationSettingItem {
  key: number
  icon: string | ReactElement
  iconStyle: IconStyles | 'custom'
  name: string
  description: string
  value: boolean
  path: string
}
export interface IViewProps {
  settingItems: ISettingItem[]
  integrationSettingItems: IIntegrationSettingItem[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const settingItems: ISettingItem[] = [
  {
    key: 1,
    icon: 'SETTINGS',
    iconStyle: 'solid',
    name: 'General',
    description: 'View and managed SaaScape configuration',
    path: '/settings/general',
  },
  {
    key: 2,
    icon: 'DOCKER',
    iconStyle: 'brands',
    name: 'Docker',
    description: 'View and managed Docker configuration',
    path: '/settings/docker',
  },
]

const ViewSettingsContainer = () => {
  const configData = useSelector((state: IStore) => state.configData) || {}
  const { enabledIntegrations } = configData
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.SETTINGS)
  }, [])

  const integrationSettingItems: IIntegrationSettingItem[] = [
    {
      key: 1,
      icon: 'STRIPE',
      iconStyle: 'brands',
      name: 'Stripe',
      description: 'View and managed Stripe configuration',
      path: '/settings/stripe',
      value: enabledIntegrations?.[constants.INTEGRATIONS.STRIPE],
    },
    {
      key: 2,
      icon: (
        <figure>
          <img
            alt={'ovh logo'}
            src={
              'https://www.google.com/url?sa=i&url=https%3A%2F%2Fuxwing.com%2Fovh-icon%2F&psig=AOvVaw06ZTaudoU97fF5H_5ON5pa&ust=1723875416806000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNC8jsHu-IcDFQAAAAAdAAAAABAE'
            }
          />
        </figure>
      ),
      iconStyle: 'custom',
      name: 'OVH',
      description: 'View and manage OVH integration',
      path: '/settings/ovh',
      value: enabledIntegrations?.[constants.INTEGRATIONS.OVH],
    },
  ]

  const viewProps: IViewProps = { settingItems, integrationSettingItems }
  return <ViewSettings {...viewProps} />
}

export default ViewSettingsContainer
