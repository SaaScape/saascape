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
import PlansContainer from "./PlansContainer"
import constants from "../../../helpers/constants/constants"

type setTopBar = (
  title: string,
  description?: string,
  right?: ReactElement
) => void

interface ITopBarConfig {
  title: string
  description?: string
  right?: ReactElement | null
}

export interface IProps {
  loading: boolean
  application: IApplication | null
  breadcrumbs: IBreadcrumbs[]
  tabItems: ITabItem[]
  topBarConfig: ITopBarConfig
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

export interface IVersionMainProps {
  application: IApplication | null
  setTopBar: setTopBar
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}
export interface IInstanceMainProps {
  application: IApplication | null
  setTopBar: setTopBar
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}
export interface IOverviewMainProps {
  application: IApplication | null
  setTopBar: setTopBar
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}
export interface IPlanMainProps {
  application: IApplication | null
  setTopBar: setTopBar
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

interface ITabItem {
  label: string
  icon: ReactElement
  children: ReactElement
  key: string
  disabled?: boolean
}

const ViewApplicationContainer = () => {
  const [application, setApplication] = useState<IApplication | null>(null)
  const [loading, setLoading] = useState(false)
  const selectedBreadcrumbs = useSelector((state: IStore) => state.breadcrumbs)
  const configData = useSelector((state: IStore) => state.configData)
  const [topBarConfig, setTopBarConfig] = useState<ITopBarConfig>({
    title: "",
    description: "",
    right: null,
  })
  const { enabledIntegrations } = configData

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

  const setTopBar: setTopBar = (title, description, right) => {
    setTopBarConfig({
      title,
      description,
      right,
    })
  }

  const pageProps: {
    instances: IInstanceMainProps
    versions: IVersionMainProps
    overview: IOverviewMainProps
    plans: IPlanMainProps
  } = {
    instances: {
      application,
      setTopBar,
    },
    versions: {
      application,
      setTopBar,
    },
    overview: {
      application,
      setTopBar,
    },
    plans: {
      application,
      setTopBar,
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
      label: "Plans",
      icon: <Icon icon='PLAN' />,
      key: "2",
      children: <PlansContainer {...pageProps.plans} />,
    },
    {
      label: "Versions",
      icon: <Icon icon='BRANCH' />,
      key: "3",
      children: <VersionsContainer {...pageProps.versions} />,
      disabled: !enabledIntegrations?.[constants.INTEGRATIONS.DOCKER],
    },
    {
      label: "Instances",
      icon: <Icon icon='SERVER' />,
      key: "4",
      children: <InstancesContainer {...pageProps.instances} />,
      disabled: !enabledIntegrations?.[constants.INTEGRATIONS.DOCKER],
    },
    {
      label: "Configuration",
      icon: <Icon icon='CONFIG' />,
      key: "5",
      children: <InstancesContainer {...pageProps.instances} />,
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
    topBarConfig,
  }

  return <ViewApplication {...viewProps} />
}

export default ViewApplicationContainer
