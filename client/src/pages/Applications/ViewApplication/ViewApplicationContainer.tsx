import { ReactElement, useEffect, useState } from "react"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import ViewApplication from "./ViewApplication"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { useParams } from "react-router-dom"
import { apiAxios } from "../../../helpers/axios"
import { useDispatch, useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { IBreadcrumbs } from "../../../store/slices/breadcrumbs"
import Icon from "../../../components/Icon"
import OverviewContainer from "./OverviewContainer"
import InstancesContainer from "./InstancesContainer"
import VersionsContainer from "./VersionsContainer"
import PlansContainer from "./PlansContainer"
import constants from "../../../helpers/constants/constants"
import {
  IApplication,
  setSelectedApplication,
} from "../../../store/slices/applicationSlice"

export interface IProps {
  loading: boolean
  application: IApplication | null
  breadcrumbs: IBreadcrumbs[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

const ViewApplicationContainer = () => {
  const { applications, selectedApplication: application } = useSelector(
    (state: IStore) => state.applications
  )
  const [loading, setLoading] = useState(false)
  const selectedBreadcrumbs = useSelector((state: IStore) => state.breadcrumbs)
  const configData = useSelector((state: IStore) => state.configData)

  const { enabledIntegrations } = configData
  const dispatch = useDispatch()

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
    dispatch(setSelectedApplication(id))
  }, [])

  useEffect(() => {
    getApplication()
  }, [])

  const getApplication = async () => {
    const application = applications.find((app) => app._id === id)
    if (application) {
      dispatch(setSelectedApplication(application))
      return
    }
    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${id}`)
    if (success) {
      dispatch(setSelectedApplication(data?.application))
    }
    setLoading(false)
  }

  const viewProps: IProps = {
    breadcrumbs: selectedBreadcrumbs,
    loading,
    application,
  }

  return <ViewApplication {...viewProps} />
}

export default ViewApplicationContainer
