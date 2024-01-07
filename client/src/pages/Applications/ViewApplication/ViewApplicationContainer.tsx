import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import ViewApplication from "./ViewApplication"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { IBreadcrumbs } from "../../../store/slices/breadcrumbs"

import { IApplication } from "../../../store/slices/applicationSlice"
import { IApplicationProps } from "../ApplicationRouteHandler"

export interface IProps {
  loading: boolean
  application: IApplication | null
  breadcrumbs: IBreadcrumbs[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ViewApplicationContainer = (props: IApplicationProps) => {
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
      breadcrumbs.VIEW_APPLICATION(application?.application_name || id, id)
    )
  }, [application])

  useEffect(() => {
    props?.setId(id)
  }, [id])

  const viewProps: IProps = {
    breadcrumbs: selectedBreadcrumbs,
    loading,
    application,
  }

  return <ViewApplication {...viewProps} />
}

export default ViewApplicationContainer
