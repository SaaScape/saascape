import Dashboard from "./Dashboard"
import { useEffect } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../helpers/constants/breadcrumbs"

const DashboardContainer = () => {
  const setBreadcrumbs = useSetBreadcrumbs()
  useEffect(() => {
    setBreadcrumbs(breadcrumbs.DASHBOARD)
  }, [])

  return <Dashboard />
}

export default DashboardContainer
