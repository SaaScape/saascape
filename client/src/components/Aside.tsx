import { Avatar } from "antd"
import MenuContainer from "./MenuContainer"
import UserMenu from "./userMenu/UserMenu"
import { useSelector } from "react-redux"
import { IStore } from "../store/store"
import { useState } from "react"
import permissions from "../helpers/constants/permissions"
import { Link } from "react-router-dom"
import Icon, { IconStyles } from "./Icon"

interface IMenuItem {
  name: string
  icon: string
  path: string
  permissions: string[]
  iconStyle?: IconStyles
  key: string
}

interface ISubMenuItem extends IMenuItem {
  subMenu: IMenuItem[]
}

const Aside = () => {
  const user = useSelector((state: IStore) => state.user)
  const configData = useSelector((state: IStore) => state.configData)
  const breadcrumbs = useSelector((state: IStore) => state.breadcrumbs)

  const { menuOpen: asideOpen } = configData

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const { selectedApplication } = useSelector(
    (state: IStore) => state.applications
  )

  const asideMenuItems: (IMenuItem | ISubMenuItem)[] = [
    {
      name: "Dashboard",
      icon: "DASHBOARD",
      path: "/",
      permissions: [permissions.STANDARD_ACCESS],
      key: "1",
    },
    {
      name: "Applications",
      icon: "APPLICATION",
      path: "/applications",
      permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
      subMenu: [
        {
          name: "Overview",
          icon: "APPLICATION",
          path: `/applications/${selectedApplication?._id}`,
          // Users can quick switch between applications by selecting the application from dropdown in breadcrumbs
          permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
          key: "1.1",
        },
        {
          name: "Plans",
          icon: "APPLICATION",
          path: `/applications/${selectedApplication?._id}/plans`,
          permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
          key: "1.2",
        },
        {
          name: "Versions",
          icon: "APPLICATION",
          path: `/applications/${selectedApplication?._id}/versions`,
          permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
          key: "1.3",
        },
        {
          name: "Instances",
          icon: "APPLICATION",
          path: `/applications/${selectedApplication?._id}/instances`,
          permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
          key: "1.4",
        },
        {
          name: "Configuration",
          icon: "SETTINGS",
          path: `/applications/${selectedApplication?._id}/configuration`,
          permissions: [permissions.APPLICATIONS.VIEW_APPLICATIONS],
          key: "1.5",
        },
      ],
      key: "2",
    },
    {
      name: "Servers",
      icon: "SERVER",
      path: "/servers",
      permissions: [permissions.STANDARD_ACCESS],
      key: "3",
    },
    {
      name: "Domains",
      icon: "DOMAIN",
      path: "/domains",
      permissions: [permissions.STANDARD_ACCESS],
      key: "4",
    },
    {
      name: "Contacts",
      icon: "CONTACTS",
      path: "/contacts",
      permissions: [permissions.STANDARD_ACCESS],
      key: "5",
    },
    {
      name: "Tenants",
      icon: "TENANT",
      path: "/tenants",
      permissions: [permissions.TENANTS.VIEW_TENANTS],
      key: "6",
    },
    {
      name: "Databases",
      icon: "DATABASE",
      path: "/databases",
      permissions: [permissions.STANDARD_ACCESS],
      key: "7",
    },
    {
      name: "Settings",
      icon: "SETTINGS",
      path: "/settings",
      permissions: [permissions.SUPER_ACCESS],
      key: "8",
    },
  ]

  const userMenuChange = (value: boolean) => {
    setUserMenuOpen(value)
  }

  const checkIfActive = (path: string) => {
    return breadcrumbs?.[0]?.path === path
  }

  const checkIfHasPerms = (permissionArray: string[]) => {
    const userPermissions = user?.permissions
    if (!userPermissions) return

    if (userPermissions.includes(permissions.SUPER_ACCESS)) return true

    for (const permission of permissionArray) {
      if (userPermissions.includes(permission)) return true
    }
  }

  const toggleSubMenuExpand = (key: string) => {
    setExpandedKeys((curr) => {
      if (curr.includes(key)) {
        return curr.filter((item) => item !== key)
      } else {
        return [...curr, key]
      }
    })
  }

  const checkIfSubMenuExpanded = (key: string) => {
    return expandedKeys.includes(key)
  }

  const generateMenuItem = (item: ISubMenuItem | IMenuItem, i: number) => {
    const isParent = "subMenu" in item && !!item?.subMenu?.length

    return isParent ? (
      <ul
        key={i}
        className={`p-relative ${checkIfActive(item.path) ? "active" : ""} ${
          checkIfSubMenuExpanded(item.key) ? "expanded" : ""
        } `}
      >
        <li
          key={i}
          className={`d-flex align-center p-relative ${
            checkIfActive(item.path) ? "active" : ""
          }`}
          onClick={() => toggleSubMenuExpand(item.key)}
        >
          <Link to={item.path}>
            <span className='icon'>
              <Icon icon={item.icon} style={item?.iconStyle || "solid"} />
            </span>
            <div className='title'>{item.name}</div>
          </Link>
        </li>

        {item?.subMenu?.map((subItem, subItemIndex) =>
          generateMenuItem(subItem, subItemIndex)
        )}
      </ul>
    ) : (
      <li
        key={i}
        className={`d-flex align-center p-relative ${
          checkIfActive(item.path) ? "active" : ""
        }`}
      >
        <Link to={item.path}>
          <span className='icon'>
            <Icon icon={item.icon} style={item?.iconStyle || "solid"} />
          </span>
          <div className='title'>{item.name}</div>
        </Link>
      </li>
    )
  }

  return (
    <aside className={`aside ${asideOpen ? "" : "hidden"}`}>
      <h1>SaaScape</h1>
      <div className={`user ${userMenuOpen ? "open" : ""}`}>
        <MenuContainer MenuComponent={<UserMenu />} onChange={userMenuChange}>
          <div className='user-menu d-flex justify-start'>
            <div className='user-image'>
              <Avatar shape='square' size={"large"}>
                {user?.first_name?.charAt(0).toUpperCase()}
                {user?.last_name?.charAt(0).toUpperCase()}
              </Avatar>
            </div>
            <div className='user-data'>
              <div className='user-name p-relative'>
                {user?.first_name} {user?.last_name}
              </div>
            </div>
          </div>
        </MenuContainer>
      </div>
      <nav>
        <ul>
          {asideMenuItems.map((item, i) => {
            if (!checkIfHasPerms(item.permissions)) return null
            return generateMenuItem(item, i)
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Aside
