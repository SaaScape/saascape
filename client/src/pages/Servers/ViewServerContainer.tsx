import { useEffect, useState } from "react"
import useSetBreadcrumbs from "../../middleware/useSetBreadcrumbs"
import ViewServer from "./ViewServer"
import breadcrumbs from "../../helpers/constants/breadcrumbs"
import { IServerState } from "../../store/slices/serverSlice"
import { useSelector } from "react-redux"
import { IStore } from "../../store/store"
import { Link, useParams } from "react-router-dom"
import constants from "../../helpers/constants/constants"
import { toast } from "react-toastify"
import { apiAxios } from "../../helpers/axios"
import Icon from "../../components/Icon"

type serverMenuItem = { text: string; onClick: () => void; icon?: string }[][]

export interface IViewProps {
  server?: IServerState
  loading: boolean
  serverMenuItems: serverMenuItem
}

const ViewServerContainer = () => {
  const servers = useSelector((state: IStore) => state.servers)
  const [server, setServer] = useState<IServerState>()
  const [loading, setLoading] = useState(false)
  const [serverMenuItems, setServerMenuItems] = useState<serverMenuItem>([])

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

  useEffect(() => {
    if (!server) return
    const serverMenuItems: serverMenuItem = [
      [
        {
          text: "Delete Server",
          onClick: () => {},
        },
      ],
    ]

    if (
      server?.server_status === constants.SERVER_STATUSES.FAILED_INITIALIZATION
    ) {
      serverMenuItems.unshift([])
      serverMenuItems[0].push({
        text: "Re-Initialize Server",
        onClick: reInitializeServer,
      })
    }
    setServerMenuItems(serverMenuItems)
  }, [server])

  const reInitializeServer = async () => {
    if (
      server?.server_status !== constants.SERVER_STATUSES.FAILED_INITIALIZATION
    ) {
      toast.error(
        "Server is not in failed initialization state, cannot reinitialize"
      )
      return
    }

    setLoading(true)
    const {
      data: { data, success },
    } = await apiAxios.put(`/servers/re-initialize/${server?._id}`)

    console.log(success, data)
    if (success) {
      setServer(data?.server || {})
    }
    setLoading(false)
  }

  const viewProps: IViewProps = { server, loading, serverMenuItems }

  return <ViewServer {...viewProps} />
}

interface IServerMenuProps {
  serverMenuItems: serverMenuItem
}
export const ServerMenu = (props: IServerMenuProps) => {
  const { serverMenuItems } = props
  return (
    <div>
      {serverMenuItems?.map((items, index) => (
        <ul key={index}>
          {items?.map((item, itemIndex) => {
            return (
              <li key={itemIndex}>
                <Link
                  to={"#"}
                  onClick={(e) => {
                    if (item?.onClick) {
                      e.preventDefault()
                      item?.onClick()
                    }
                  }}
                >
                  {item?.icon && <Icon icon={item?.icon} />}
                  <span>{item.text}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}
export default ViewServerContainer
