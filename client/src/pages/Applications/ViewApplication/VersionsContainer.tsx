import { useState } from "react"
import { IApplication } from "../ApplicationsContainer"
import Versions from "./Versions"
import { IVersionMainProps } from "./ViewApplicationContainer"

export interface IVersionProps {
  loading: boolean
  application: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
  versionColumns: any
}

const versionColumns = [
  {
    title: "Version",
    dataIndex: "version",
    key: "version",
  },
  {
    title: "Latest Push",
    dataIndex: "latest_push",
    key: "latest_push",
  },
  {
    title: "Latest Commit",
    dataIndex: "latest_commit",
    key: "latest_commit",
  },
  {
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
    align: "right",
  },
]

const VersionsContainer = (props: IVersionMainProps) => {
  const [loading, setLoading] = useState(false)
  const versionProps: IVersionProps = {
    loading,
    application: props.application,
    versionColumns,
  }

  /* 
     
    What to do here?

    Versions can be manually added with reference to the docker image and then instances can use that version, we will need to run validation on the version by pulling the image, so Docker must be configured. But if docker hub is configured, then versions will be added automatically via the docker hub webhooks and api.

  */

  return <Versions {...versionProps} />
}

export default VersionsContainer
