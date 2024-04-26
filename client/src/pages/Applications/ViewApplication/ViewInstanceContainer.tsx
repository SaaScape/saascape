import { useParams } from "react-router-dom"
import { IApplicationProps } from "../ApplicationRouteHandler"
import ViewInstance from "./ViewInstance"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import { useEffect, useState } from "react"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { IInstance } from "./InstancesContainer"
import { apiAxios } from "../../../helpers/axios"

export interface IViewProps {
  instance: IInstance | null
}

const ViewInstanceContainer = ({ setId }: IApplicationProps) => {
  const [instance, setInstance] = useState<IInstance | null>(null)
  const { selectedApplication } = useSelector(
    (state: IStore) => state?.applications
  )
  const { id, instanceId } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()

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

  const getInstance = async () => {
    if (!id || !instanceId) return
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${id}/instances/${instanceId}`)
    if (success) {
      setInstance(data?.instance)
    }
  }

  return <ViewInstance instance={instance} />
}

export default ViewInstanceContainer
