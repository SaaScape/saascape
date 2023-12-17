import { useEffect } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import Domains from "./Domains"

export const DomainsContainer = () => {
  const setBreadcrumbs = useSetBreadcrumbs()
  useEffect(() => {
    setBreadcrumbs(breadcrumbs.DOMAINS)
  }, [])
  return <Domains />
}
