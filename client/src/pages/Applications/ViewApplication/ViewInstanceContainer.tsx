/*
 * Copyright SaaScape (c) 2024.
 */

import { Link, useNavigate, useParams } from 'react-router-dom'
import { IApplicationProps } from '../ApplicationRouteHandler'
import ViewInstance from './ViewInstance'
import useSetBreadcrumbs from '../../../middleware/useSetBreadcrumbs'
import { useEffect, useState } from 'react'
import breadcrumbs from '../../../helpers/constants/breadcrumbs'
import { useSelector } from 'react-redux'
import { IStore } from '../../../store/store'
import IInstance, { instanceServiceStatus } from 'types/schemas/Instances'
import { apiAxios, apiAxiosToast } from '../../../helpers/axios'
import { Popconfirm, TabsProps } from 'antd'
import Icon from '../../../components/Icon'
import EnvironmentConfig from '../../../components/Applications/configuration/EnvironmentConfig'
import SecretsConfig from '../../../components/Applications/configuration/SecretsConfig'
import InstanceOverview from '../../../components/Applications/Instances/InstanceOverview'
import SideFullMenu from '../../../components/SideFullMenu.tsx'
import EditInstanceMenu from '../../../components/Applications/Instances/EditInstanceMenu.tsx'
import { IMenuContainerRef, useMenuContainer } from '../../../components/MenuContainer.tsx'
import VersionSelectionModal from '../../../components/Applications/Instances/VersionSelectionModal.tsx'
import { ConfigModules } from 'types/enums.ts'
import { toast } from 'react-toastify'

export interface IViewProps {
  instance?: IInstance
  instanceTabs: TabsProps['items']
  instanceMenuItems: instanceMenuItem
  toggleInstanceEdit: (open: boolean) => void
  instanceMenuContainer: IMenuContainerRef
}

type instanceMenuItem = {
  text: string | React.ReactNode
  onClick: () => void
  icon?: string
}[][]

const instanceStatusMap: {
  running: instanceServiceStatus[]
  failed: instanceServiceStatus[]
  stopped: instanceServiceStatus[]
  preConfig: instanceServiceStatus[]
} = {
  running: [instanceServiceStatus.RUNNING],
  failed: [instanceServiceStatus.CREATION_FAILED, instanceServiceStatus.FAILED],
  stopped: [instanceServiceStatus.STOPPED],
  preConfig: [instanceServiceStatus.PRE_CONFIGURED],
}

const ViewInstanceContainer = ({ setId }: IApplicationProps) => {
  const [instance, setInstance] = useState<IInstance>()
  const [instanceMenuItems, setInstanceMenuItems] = useState<instanceMenuItem>([])
  const [showEditInstance, setShowEditInstance] = useState(false)
  const [showVersionSelectionModal, setShowVersionSelectionModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const { selectedApplication } = useSelector((state: IStore) => state.applications)

  const { id, instanceId } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()
  const instanceMenuContainer = useMenuContainer()

  useEffect(() => {
    setId(id)
  }, [id])

  useEffect(() => {
    if (!id || !instanceId) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_INSTANCE(
        selectedApplication?.application_name || id,
        id,
        instanceId,
        instance?.name || instanceId,
      ),
    )
  }, [selectedApplication, instance])

  useEffect(() => {
    getInstance()
  }, [instanceId])

  useEffect(() => {
    if (!instance) return
    const instanceMenuItems: instanceMenuItem = [
      [
        {
          text: 'Configure',
          onClick: () => {
            instanceMenuContainer?.closeMenu?.()
            toggleInstanceEdit(true)
          },
        },
      ],
      [
        {
          text: (
            <Popconfirm
              onConfirm={deleteInstance}
              title={`Are you sure that you want to delete, ${instance.name}?`}
            >{`Delete Instance`}</Popconfirm>
          ),
          onClick: () => {},
        },
      ],
    ]

    if (!instance?.tenant) {
      instanceMenuItems.unshift([{ text: 'Allocate Tenant', onClick: () => {} }])
    }

    if (instanceStatusMap.running.includes(instance.service_status)) {
      const runningItems: instanceMenuItem = [
        [{ text: 'Deploy Version', onClick: () => {} }],
        [
          {
            text: 'Stop Instance',
            onClick: () => {},
          },
          {
            text: 'Restart',
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...runningItems)
    } else if (instanceStatusMap.failed.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [
          {
            text: 'Re-Initialize Instance',
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...items)
    } else if (instanceStatusMap.stopped.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [
          {
            text: 'Start Instance',
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...items)
    } else if (instanceStatusMap.preConfig.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [
          {
            text: 'Deploy Instance',
            onClick: () => {},
          },
          {
            text: 'Select Version',
            onClick: () => {
              toggleVersionSelectionModal(true)
            },
          },
        ],
      ]
      instanceMenuItems.unshift(...items)
    }
    setInstanceMenuItems(instanceMenuItems)
  }, [instance])

  const getInstance = async () => {
    if (!id || !instanceId) return
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${id}/instances/${instanceId}`)
    if (success) {
      setInstance(data?.instance)
    }
  }

  const deleteInstance = async () => {
    if (!id || !instanceId) return
    const {
      data: { success },
    } = await apiAxios.delete(`/applications/${id}/instances/${instanceId}`)
    if (success) {
      navigate(`/applications/${id}/instances/`)
    }
  }

  // const getVersion = async (id: string) => {
  //   if (!id) return
  //   const {
  //     data: { data, success },
  //   } = await apiAxios.get(`/applications/${id}/versions/${id}`)
  //   if (success) {
  //     setVersionData(data?.version)
  //   }
  // }

  const toggleInstanceEdit = (open: boolean) => {
    setShowEditInstance(open)
  }

  const toggleVersionSelectionModal = (open: boolean) => {
    setShowVersionSelectionModal(open)
  }

  const instanceTabs = [
    {
      key: 'overview',
      label: 'Overview',
      children: selectedApplication && (
        <InstanceOverview
          application={selectedApplication}
          instance={instance}
          setInstance={setInstance}
          toggleInstanceEdit={toggleInstanceEdit}
        />
      ),
    },
    {
      key: 'config',
      label: 'Environment Config',
      children: selectedApplication && <EnvironmentConfig application={selectedApplication} instance={instance} />,
    },
    {
      key: 'secrets',
      label: 'Secrets',
      children: selectedApplication && <SecretsConfig application={selectedApplication} instance={instance} />,
    },
    {
      key: 'logs',
      label: 'Logs',
    },
  ]

  /**
   * TODO: When editing an instance changes will be submitted to the database but the docker service will
   * not be updated with the new configuration until the instance is redeployed
   */

  const onInstanceSave = async (values: any) => {
    setSaving(true)
    const toastId = toast('Updating instance...', { isLoading: true })
    const { data } = await apiAxiosToast(toastId).put(`/applications/${id}/instances/${instanceId}`, values)
    if (data.success) {
      setInstance(data?.data?.instance?.instance)
      toggleInstanceEdit(false)
      toast.update(toastId, { isLoading: false, type: 'success', render: 'Instance updated successfully' })
    }
    setSaving(false)
  }

  const onVersionUpdate = async (data: any) => {
    setSaving(true)

    const toastId = toast('Updating version...', { isLoading: true })

    const payload = {
      configModule: ConfigModules.INSTANCE_VERSION,
      version_id: data.version_id,
      updateService: false,
    }
    const { data: responseData } = await apiAxiosToast(toastId).put(
      `/applications/${id}/instances/${instanceId}/config`,
      payload,
    )

    if (responseData.success) {
      setInstance(responseData?.data?.instance?.instance)
      toggleVersionSelectionModal(false)
      toast.update(toastId, { isLoading: false, type: 'success', render: 'Version updated successfully' })
    }

    setSaving(false)
  }

  return (
    <>
      <ViewInstance
        toggleInstanceEdit={toggleInstanceEdit}
        instance={instance}
        instanceTabs={instanceTabs}
        instanceMenuItems={instanceMenuItems}
        instanceMenuContainer={instanceMenuContainer}
      />
      <SideFullMenu
        onClose={() => {
          toggleInstanceEdit(false)
        }}
        title={'Edit Instance'}
        visible={showEditInstance}
      >
        <EditInstanceMenu
          saving={saving}
          instance={instance}
          onClose={() => {
            toggleInstanceEdit(false)
          }}
          onSave={onInstanceSave}
        />
      </SideFullMenu>

      <VersionSelectionModal
        selectedApplication={selectedApplication}
        instance={instance}
        open={showVersionSelectionModal}
        onCancel={() => {
          toggleVersionSelectionModal(false)
        }}
        onVersionUpdate={onVersionUpdate}
        saving={saving}
      />
    </>
  )
}

interface IInstanceMenuProps {
  instanceMenuItems: instanceMenuItem
}

export const InstanceMenu = (props: IInstanceMenuProps) => {
  const { instanceMenuItems } = props
  return (
    <div>
      {instanceMenuItems?.map((items, index) => (
        <ul key={index}>
          {items?.map((item, itemIndex) => {
            return (
              <li key={itemIndex}>
                <Link
                  to={'#'}
                  onClick={(e) => {
                    if (item?.onClick) {
                      e.preventDefault()
                      e.stopPropagation()
                      item?.onClick()
                    }
                  }}
                >
                  {item?.icon && <Icon icon={item?.icon} />}
                  <span>{item.text}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}

export default ViewInstanceContainer
