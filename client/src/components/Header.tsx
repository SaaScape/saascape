import { Avatar, Badge, Input } from "antd"
import Icon from "./Icon"

import { IStore } from "../store/store"
import { useDispatch, useSelector } from "react-redux"
import MenuContainer from "./MenuContainer"
import UserMenu from "./userMenu/UserMenu"
import NotificationMenu from "./notifications/NotificationMenu"
import { setConfigData } from "../store/slices/configData"

const Header = () => {
  const user = useSelector((state: IStore) => state.user)
  const notifications = useSelector((state: IStore) => state?.notifications)
  const configData = useSelector((state: IStore) => state.configData)

  const dispatch = useDispatch()

  const toggleAsideMenu = () => {
    dispatch(setConfigData({ menuOpen: !configData.menuOpen }))
  }

  return (
    <header>
      <div className='container d-flex justify-between align-center'>
        <div className='d-flex align-center'>
          <span className='menu-toggle' onClick={toggleAsideMenu}>
            <Icon icon='BARS' />
          </span>
          <div className='search-container'>
            <Input placeholder='Search...' />
            <span className='icon'>
              <Icon icon='SEARCH' />
            </span>
          </div>
        </div>
        <div className='d-flex align-center'>
          <div className='notifications'>
            <MenuContainer MenuComponent={<NotificationMenu />}>
              <Icon icon='BELL' style='regular' />
              <Badge count={notifications?.length} />
            </MenuContainer>
          </div>
          <MenuContainer MenuComponent={<UserMenu />}>
            <div className='user-menu'>
              <div className='user-image'>
                <Avatar shape='square'>
                  {user?.first_name?.charAt(0).toUpperCase()}
                  {user?.last_name?.charAt(0).toUpperCase()}
                </Avatar>
              </div>
            </div>
          </MenuContainer>
        </div>
      </div>
    </header>
  )
}

export default Header
