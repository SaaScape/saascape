import { ReactElement, useEffect, useState } from "react"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import ViewApplication from "./ViewApplication"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import { useParams } from "react-router-dom"
import { IApplication } from "../ApplicationsContainer"
import { apiAxios } from "../../../helpers/axios"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { IBreadcrumbs } from "../../../store/slices/breadcrumbs"
import Icon from "../../../components/Icon"
import OverviewContainer from "./OverviewContainer"
import InstancesContainer from "./InstancesContainer"
import VersionsContainer from "./VersionsContainer"

export interface IProps {
  loading: boolean
  application: IApplication | null
  breadcrumbs: IBreadcrumbs[]
  tabItems: ITabItem[]
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

export interface IVersionMainProps {
  application: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}
export interface IInstanceMainProps {
  application: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}
export interface IOverviewMainProps {
  application: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

interface ITabItem {
  label: string
  icon: ReactElement
  children: ReactElement
  key: string
}

const ViewApplicationContainer = () => {
  const [application, setApplication] = useState<IApplication | null>(null)
  const [loading, setLoading] = useState(false)
  const selectedBreadcrumbs = useSelector((state: IStore) => state.breadcrumbs)

  const setBreadcrumbs = useSetBreadcrumbs()
  const params = useParams()
  const { id } = params

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION(application?.application_name || id, id)
    )
  }, [application])

  useEffect(() => {
    getApplication()
  }, [])

  const pageProps: {
    instances: IInstanceMainProps
    versions: IVersionMainProps
    overview: IOverviewMainProps
  } = {
    instances: {
      application,
    },
    versions: {
      application,
    },
    overview: {
      application,
    },
  }

  const tabItems: ITabItem[] = [
    {
      label: "Overview",
      icon: <Icon icon='DASHBOARD' />,
      key: "1",
      children: <OverviewContainer {...pageProps.overview} />,
    },
    {
      label: "Instances",
      icon: <Icon icon='SERVER' />,
      key: "2",
      children: <InstancesContainer {...pageProps.instances} />,
    },
    {
      label: "Versions",
      icon: <Icon icon='BRANCH' />,
      key: "3",
      children: <VersionsContainer {...pageProps.versions} />,
    },
  ]

  const getApplication = async () => {
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications/${id}`)
    if (success) {
      setApplication(data?.application)
    }
  }

  const viewProps: IProps = {
    breadcrumbs: selectedBreadcrumbs,
    loading,
    application,
    tabItems,
  }

  return <ViewApplication {...viewProps} />
}

export default ViewApplicationContainer
