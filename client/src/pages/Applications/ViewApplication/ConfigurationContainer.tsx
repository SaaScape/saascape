import { useEffect, useState } from "react"
import { IApplicationProps } from "../ApplicationRouteHandler"
import Configuration from "./Configuration"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { IStore } from "../../../store/store"
import { IApplication } from "../../../store/slices/applicationSlice"
import { IBreadcrumbs } from "../../../store/slices/breadcrumbs"
import { TabsProps } from "antd"
import CustomFields from "../../../components/Applications/configuration/CustomFields"

export interface IProps {
  loading: boolean
  application: IApplication | null
  breadcrumbs: IBreadcrumbs[]
  configTabs: TabsProps["items"]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

export interface IViewProps {}

const ConfigurationContainer = (props: IApplicationProps) => {
  const { selectedApplication: application } = useSelector(
    (state: IStore) => state.applications
  )
  const [loading] = useState(false)
  const selectedBreadcrumbs = useSelector((state: IStore) => state.breadcrumbs)

  const params = useParams()
  const { id } = params

  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_CONFIGURATION(
        application?.application_name || id,
        id
      )
    )
  }, [application])

  useEffect(() => {
    props?.setId(id)
  }, [id])

  const configTabs: TabsProps["items"] = [
    {
      key: "custom-fields",
      label: "Custom Fields",
      children: <CustomFields application={application} loading={loading} />,
    },
  ]

  const viewProps: IProps = {
    loading,
    application,
    breadcrumbs: selectedBreadcrumbs,
    configTabs,
  }

  return <Configuration {...viewProps} />
}

export default ConfigurationContainer
