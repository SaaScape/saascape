import React from "react"
import { useSelector } from "react-redux"
import { IStore } from "../store/store"
import permissionConstants from "../helpers/constants/permissions"

interface IProps {
  permissions?: string[]
  component: React.ReactElement
}

const ProtectedRoute = (props: IProps) => {
  const { permissions, component } = props

  const userObj = useSelector((state: IStore) => state?.user)
  const { permissions: userPermissions } = userObj

  const isAuth = () => {
    // Check auth stuff and then return component if ok
    if (!permissions?.length) return component
    if (userPermissions.includes(permissionConstants.SUPER_ACCESS))
      return component
    for (const permission of permissions) {
      if (userPermissions.includes(permission)) return component
    }

    return <div>Not authorized to access this page</div>
  }

  return isAuth()
}

export default ProtectedRoute
