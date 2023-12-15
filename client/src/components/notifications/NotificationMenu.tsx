import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { IStore } from "../../store/store"
import { addNotifications } from "../../store/slices/notificationsSlice"
import Icon from "../Icon"

const NotificationMenu = () => {
  const notifications = useSelector((state: IStore) => state?.notifications)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      addNotifications([
        { title: "Your post has been liked", message: "5 minutes ago" },
        { title: "Your post has been disliked", message: "5 minutes ago" },
      ])
    )
  }, [])

  return (
    <div className='component-notification-menu'>
      <div className='d-flex align-center justify-center notification-header'>
        {notifications?.length} New Notifications
      </div>
      <ul>
        {notifications?.map((item, itemIndex) => {
          return (
            <li key={itemIndex}>
              <Link to='/'>
                <div className='notification-icon'>
                  <Icon icon='BELL' style='regular' />
                </div>
                <div className='notification-data'>
                  <div className='title'>{item.title}</div>
                  <div className='message'>{item.message}</div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className='d-flex align-center justify-center notification-footer'>
        <Link to='/'>View all notifications</Link>
      </div>
    </div>
  )
}

export default NotificationMenu
