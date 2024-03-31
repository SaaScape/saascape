import { useEffect, useState } from "react"
import Versions from "./Versions"
import { IApplication } from "../../../store/slices/applicationSlice"
import { useSelector } from "react-redux"
import { IStore } from "../../../store/store"
import { useParams } from "react-router-dom"
import breadcrumbs from "../../../helpers/constants/breadcrumbs"
import useSetBreadcrumbs from "../../../middleware/useSetBreadcrumbs"
import { IApplicationProps } from "../ApplicationRouteHandler"
import ManageVersionModal from "../../../components/Applications/ManageVersionModal"
import { apiAxios, apiAxiosToast } from "../../../helpers/axios"
import { toast } from "react-toastify"

export interface IVersion {
  _id: string
  namespace: string
  repository: string
  tag: string
  created_at: Date
  updated_at: Date
}
export interface IVersionProps {
  loading: boolean
  selectedApplication: IApplication | null
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
  versionColumns: any
  versions: IVersion[]
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

const VersionsContainer = (props: IApplicationProps) => {
  const [loading, setLoading] = useState(false)
  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )
  const [versions, setVersions] = useState<IVersion[]>([])
  const [showManageVersionModal, setShowManageVersionModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const { id } = useParams()
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    props.setId(id)
  }, [id])

  useEffect(() => {
    if (!id) return
    setBreadcrumbs(
      breadcrumbs.VIEW_APPLICATION_VERSIONS(
        selectedApplication?.application_name || id,
        id
      )
    )
  }, [selectedApplication])

  const openManageVersionModal = () => {
    setShowManageVersionModal(true)
  }
  const onManageVersionClose = () => {
    setShowManageVersionModal(false)
  }

  const onCreateVersion = async (values: any) => {
    console.log(values)

    setSaving(true)
    const toastSaving = toast.info("Creating version...", {
      isLoading: true,
    })
    const { data } = await apiAxiosToast(toastSaving)?.post(`/versions`, values)
    if (data?.success) {
      toast.update(toastSaving, {
        isLoading: false,
        type: "success",
        render: "Version created successfully",
        autoClose: 2000,
      })
      onManageVersionClose()
    }
    setSaving(false)
    console.log(data)
    setVersions((curr) => [...curr, data.data])
  }

  const versionProps: IVersionProps = {
    loading,
    selectedApplication,
    versionColumns,
    versions,
    functions: {
      openManageVersionModal,
    },
  }

  /* 
     
    What to do here?

    Versions can be manually added with reference to the docker image and then instances can use that version, we will need to run validation on the version by pulling the image, so Docker must be configured. But if docker hub is configured, then versions will be added automatically via the docker hub webhooks and api.

  */

  return (
    <>
      <Versions {...versionProps} />
      <ManageVersionModal
        open={showManageVersionModal}
        onManageVersionClose={onManageVersionClose}
        onCreateVersion={onCreateVersion}
        saving={saving}
      />
    </>
  )
}

export default VersionsContainer
