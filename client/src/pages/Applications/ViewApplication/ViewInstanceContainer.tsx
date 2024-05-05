import { Link, useNavigate, useParams } from "react-router-dom"
import { IApplicationProps } from "../ApplicationRouteHandler"
import ViewInstance from "./ViewInstance"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import { useEffect, useState } from "react"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import IInstance, { serviceStatus } from "types/schemas/Instances"
import { apiAxios } from "../../../helpers/axios"
import { Popconfirm, TabsProps } from "antd"
import Icon from "../../../components/Icon"
import EnvironmentConfig from "../../../components/Applications/configuration/EnvironmentConfig"
import SecretsConfig from "../../../components/Applications/configuration/SecretsConfig"
import InstanceOverview from "../../../components/Applications/Instances/InstanceOverview"

export interface IViewProps {
  instance?: IInstance
  instanceTabs: TabsProps["items"]
  instanceMenuItems: instanceMenuItem
}

type instanceMenuItem = {
  text: string | React.ReactNode
  onClick: () => void
  icon?: string
}[][]

const instanceStatusMap: {
  running: serviceStatus[]
  failed: serviceStatus[]
  stopped: serviceStatus[]
  preConfig: serviceStatus[]
} = {
  running: ["running"],
  failed: ["creation-failed", "failed"],
  stopped: ["stopped"],
  preConfig: ["pre-configured"],
}

const ViewInstanceContainer = ({ setId }: IApplicationProps) => {
  const [instance, setInstance] = useState<IInstance>()
  const [instanceMenuItems, setInstanceMenuItems] = useState<instanceMenuItem>(
    []
  )
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )
  const { id, instanceId } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()

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
        instance?.name || instanceId
      )
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
      instanceMenuItems.unshift([
        { text: "Allocate Tenant", onClick: () => {} },
      ])
    }

    if (instanceStatusMap.running.includes(instance.service_status)) {
      const runningItems: instanceMenuItem = [
        [{ text: "Deploy Version", onClick: () => {} }],
        [
          {
            text: "Stop Instance",
            onClick: () => {},
          },
          {
            text: "Restart",
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...runningItems)
    } else if (instanceStatusMap.failed.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [
          {
            text: "Re-Initialize Instance",
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...items)
    } else if (instanceStatusMap.stopped.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [
          {
            text: "Start Instance",
            onClick: () => {},
          },
        ],
      ]
      instanceMenuItems.unshift(...items)
    } else if (instanceStatusMap.preConfig.includes(instance.service_status)) {
      const items: instanceMenuItem = [
        [{ text: "Deploy Instance", onClick: () => {} }],
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

  const instanceTabs = [
    {
      key: "overview",
      label: "Overview",
      children: selectedApplication && (
        <InstanceOverview
          application={selectedApplication}
          instance={instance}
          setInstance={setInstance}
        />
      ),
    },
    {
      key: "config",
      label: "Environment Config",
      children: selectedApplication && (
        <EnvironmentConfig
          application={selectedApplication}
          instance={instance}
        />
      ),
    },
    {
      key: "secrets",
      label: "Secrets",
      children: selectedApplication && (
        <SecretsConfig application={selectedApplication} instance={instance} />
      ),
    },
    {
      key: "logs",
      label: "Logs",
    },
  ]

  return (
    <ViewInstance
      instance={instance}
      instanceTabs={instanceTabs}
      instanceMenuItems={instanceMenuItems}
    />
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
                  to={"#"}
                  onClick={(e) => {
                    if (item?.onClick) {
                      e.preventDefault()
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
