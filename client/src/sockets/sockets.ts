import { store } from '../store/store'

import { io } from 'socket.io-client'
import { NotificationEvents } from 'types/sockets.ts'
import { addNotifications, markAsRead, removeNotification } from '../store/slices/notificationsSlice.ts'

const socket = io()

socket.on('connect', () => {
  console.log('connected')
})

socket.on(NotificationEvents.NEW_NOTIFICATION, (notification) => {
  store.dispatch(addNotifications([notification]))
})
socket.on(NotificationEvents.READ_NOTIFICATION, (notificationId) => {
  store.dispatch(markAsRead(notificationId))
})
socket.on(NotificationEvents.DELETED_NOTIFICATION, (notificationId) => {
  store.dispatch(removeNotification(notificationId))
})

export default socket
