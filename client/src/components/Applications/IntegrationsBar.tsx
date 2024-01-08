import { useSelector } from "react-redux"
import constants from "../../helpers/constants/constants"
import { IStore } from "../../store/store"
import { useEffect, useState } from "react"
import { ILinkedId } from "../../interfaces/interfaces"
import { Tooltip } from "antd"

/* 
WHAT DOES INTEGRATIONS BAR DO AND NEED

DOES:
Displayed a bar with all of the integrations associated with entity and a plus icon if more are available

NEED:
Needs to retrieve a list of all enabled integrations for SaaScape as well as a list of linkedIds associated with the entity, the linkedIds will appear as integration items as long as that integration is enabled.

*/

interface IProps {
  linkedIds: ILinkedId[]
}

const IntegrationsBar = (props: IProps) => {
  const [availableIntegrations, setAvailableIntegrations] = useState<string[]>(
    []
  )

  const { linkedIds } = props

  const { enabledIntegrations: integrations } = useSelector(
    (state: IStore) => state.configData
  )

  useEffect(() => {
    getAvailableIntegrations()
  }, [integrations])

  const integrationLogoMap = {
    [constants.INTEGRATIONS.DOCKER]: "/files/images/docker.svg",
    [constants.INTEGRATIONS.DOCKER_HUB]: "/files/images/docker_hub.svg",
    [constants.INTEGRATIONS.STRIPE]: "/files/images/stripe.svg",
  }

  const getAvailableIntegrations = () => {
    setAvailableIntegrations(
      Object.entries(integrations)
        .filter(([_, value]) => value)
        .map(([key]) => key)
    )
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
        className='integration-item d-flex align-center justify-center'
      >
        {item}
      </div>
    )
  }

  return (
    <div className='custom-component integrations-bar d-flex align-center justify-center'>
      {linkedIds?.map((linkedId) => generateIntegrationItem(linkedId))}
      {generateIntegrationItem()}
    </div>
  )
}

export default IntegrationsBar
