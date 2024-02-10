import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import ViewServer from "./ViewServer"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import { IServerState } from "../../store/slices/serverSlice"
import { useSelector } from "react-redux"
import { IStore } from "../../store/store"
import { useParams } from "react-router-dom"

export interface IViewProps {
  server?: IServerState
  loading: boolean
}

const ViewServerContainer = () => {
  const servers = useSelector((state: IStore) => state.servers)
  const [server, setServer] = useState<IServerState>()
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const { id } = params
  const setBreadcrumbs = useSetBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs(
      breadcrumbs.VIEW_SERVER(server?.server_name || id || "", id || "")
    )
  }, [server])

  useEffect(() => {
    setLoading(true)
    const server = servers.find((server) => server._id === id)
    if (!server) return
    setServer(server)
    setLoading(false)
  }, [servers])

  const viewProps: IViewProps = { server, loading }

  return <ViewServer {...viewProps} />
}

export default ViewServerContainer
