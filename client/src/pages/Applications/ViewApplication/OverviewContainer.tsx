import { useEffect } from "react"
import Overview from "./Overview"
import { IInstanceMainProps } from "./ViewApplicationContainer"

const OverviewContainer = (props: IInstanceMainProps) => {
  useEffect(() => {
    props.setTopBar("Overview", "Overview of the application")
  }, [])
  return <Overview />
}

export default OverviewContainer
