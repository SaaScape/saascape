import { useSelector } from "react-redux"
import constants from "../../helpers/constants/constants"
import { IStore } from "../../store/store"
import { useEffect, useState } from "react"
import { ILinkedId } from "../../interfaces/interfaces"
import { Tooltip } from "antd"
import MenuContainer from "../MenuContainer"

interface IProps {
  linkedIds: ILinkedId[]
  supportedIntegrations?: string[]
  type?: "transparent" | "full"
}
interface IAddIntegrationProps {
  children: React.ReactNode
  availableIntegrations: string[]
  integrationLogoMap: any
  usedIntegrations: string[]
}

const IntegrationsBar = (props: IProps) => {
  const { type = "full" } = props
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>(
    []
  )
  const [usedIntegrations, setUsedIntegrations] = useState<string[]>([])

  const { linkedIds } = props

  const { enabledIntegrations: integrations } = useSelector(
    (state: IStore) => state.configData
  )

  useEffect(() => {
    getAvailableIntegrations()
  }, [integrations])
  useEffect(() => {
    getUsedIntegrations()
  }, [linkedIds])

  const integrationLogoMap = {
    [constants.INTEGRATIONS.DOCKER]: "/files/images/docker.svg",
    [constants.INTEGRATIONS.DOCKER_HUB]: "/files/images/docker_hub.svg",
    [constants.INTEGRATIONS.STRIPE]: "/files/images/stripe.svg",
  }

  const getAvailableIntegrations = () => {
    setAvailableIntegrations(
      Object.entries(integrations)
        .filter(
          ([name, value]) =>
            value &&
            (props?.supportedIntegrations
              ? props?.supportedIntegrations?.includes(name)
              : true)
        )
        .map(([key]) => key)
    )
  }
  const getUsedIntegrations = () => {
    const usedIntegrations = [
      ...new Set(linkedIds.map((linkedId) => linkedId.name)),
    ]
    setUsedIntegrations(usedIntegrations)
  }

  const generateIntegrationItem = (linkedIdObj?: ILinkedId) => {
    // Check if the integration is enabled
    const integration =
      linkedIdObj &&
      availableIntegrations.find(
        (integration) => integration === linkedIdObj.name
      )

    if (linkedIdObj && !integration) return

    const item = integration ? (
      <Tooltip title={integration}>
        <img src={integrationLogoMap[integration]} alt={integration} />
      </Tooltip>
    ) : (
      <span>+</span>
    )

    return (
      <div
        key={integration || "add_integration"}
        className={`integration-item d-flex align-center justify-center ${
          integration ? "" : "add-integration"
        }`}
      >
        {item}
      </div>
    )
  }

  return (
    <div
      className={`custom-component integrations-bar ${type} d-flex align-center justify-center`}
    >
      {linkedIds?.map((linkedId) => generateIntegrationItem(linkedId))}
      <AddIntegrationMenu
        availableIntegrations={availableIntegrations}
        integrationLogoMap={integrationLogoMap}
        usedIntegrations={usedIntegrations}
      >
        {generateIntegrationItem()}
      </AddIntegrationMenu>
    </div>
  )
}

const AddIntegrationMenu = (props: IAddIntegrationProps) => {
  const integrations = props.availableIntegrations.filter(
    (integration) => !props.usedIntegrations?.includes(integration)
  )
  if (!integrations.length) return null
  const menu = (
    <div className='add-integration-menu'>
      <ul>
        {integrations.map((integration) => {
          return (
            <li key={integration} className='d-flex align-center'>
              <img
                className='integration-logo'
                src={props?.integrationLogoMap[integration]}
                alt={integration}
              />
              <span>{integration}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return <MenuContainer MenuComponent={menu}>{props.children}</MenuContainer>
}

export default IntegrationsBar
