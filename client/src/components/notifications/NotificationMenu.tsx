import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { IStore } from '../../store/store'
import { markAsRead as markAsReadReducer, removeNotification } from '../../store/slices/notificationsSlice'
import Icon from '../Icon'
import { INotification } from 'types/schemas/Notifications.ts'
import { apiAxios } from '../../helpers/axios.ts'

const NotificationMenu = () => {
  const notifications = useSelector((state: IStore) => state?.notifications)

  const unreadNotifications = notifications?.filter((notification) => !notification.read)

  const dispatch = useDispatch()

  const markAsRead = async (notification: INotification) => {
    if (notification.read) return
    const { data } = await apiAxios.patch(`/notifications/${notification._id}`)
    if (!data?.success) {
      return
    }
    dispatch(markAsReadReducer(notification?._id))
  }

  return (
    <div className="component-notification-menu">
      <div className="d-flex align-center justify-center notification-header">
        {unreadNotifications?.length} New Notifications
      </div>
      <ul>
        {notifications?.map((item, itemIndex) => {
          return (
            <li
              key={itemIndex}
              onClick={() => markAsRead(item)}
              className={`d-flex space-between align-center ${!item?.read ? 'new' : ''}`}
            >
              <Link to={item?.link || ''}>
                <div className="notification-icon">
                  <Icon icon="BELL" style="regular" />
                </div>
                <div className="notification-data">
                  <div className="title">{item.title}</div>
                  <div className="message">{item.body}</div>
                </div>
              </Link>
              <NotificationActionMenu notification={item} />
            </li>
          )
        })}
      </ul>
      <div className="d-flex align-center justify-center notification-footer">
        <Link to="/">View all notifications</Link>
      </div>
    </div>
  )
}

interface INotificationActionMenuProps {
  notification: INotification
}

const NotificationActionMenu = ({ notification }: INotificationActionMenuProps) => {
  const dispatch = useDispatch()

  const deleteNotification = async () => {
    const { data } = await apiAxios.delete(`/notifications/${notification._id}`)
    if (!data?.success) {
      return
    }
    dispatch(removeNotification(notification?._id))
  }

  return (
    <ul
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      className={'actions d-flex align-center justify-center'}
    >
      <span onClick={deleteNotification}>
        <Icon icon={'TRASH'} />
      </span>
    </ul>
  )
}

export default NotificationMenu
