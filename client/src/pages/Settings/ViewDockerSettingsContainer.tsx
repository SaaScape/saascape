import ViewDockerSettings from "./ViewDockerSettings"

export interface IViewProps {}

const ViewDockerSettingsContainer = () => {
  const viewProps: IViewProps = {}
  return <ViewDockerSettings {...viewProps} />
}

export default ViewDockerSettingsContainer
