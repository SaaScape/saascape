import { useEffect } from "react"
import Instances from "./Instances"
import { IApplicationProps } from "../ApplicationRouteHandler"
import { useParams } from "react-router-dom"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { IStore } from "../../../store/store"
import { useSelector } from "react-redux"
import { IApplication } from "../../../store/slices/applicationSlice"

export interface IProps {
  selectedApplication: IApplication | null
}

const InstancesContainer = (props: IApplicationProps) => {
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )
  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    props.setId(id)
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_INSTANCES(
        selectedApplication?.application_name || id,
        id
      )
    )
  }, [selectedApplication])

  const instanceProps: IProps = {
    selectedApplication,
  }

  return <Instances {...instanceProps} />
}

export default InstancesContainer
