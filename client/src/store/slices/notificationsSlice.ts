import { createSlice } from '@reduxjs/toolkit'
import { INotification } from 'types/schemas/Notifications.ts'

type InitialState = INotification[]
const initialState: InitialState = []

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action) {
      const { payload } = action
      return payload
    },
    addNotifications(state, action) {
      const { payload } = action
      state.unshift(...payload)
    },
    markAsRead(state, action) {
      const { payload } = action
      state = state.map((item: INotification) => {
        if (item?._id !== payload) return item
        item.read = true
        return item
      })
    },
    removeNotification(state, action) {
      const { payload } = action
      state = state.filter((item: INotification) => item._id !== payload)
      return state
    },
  },
})

export default notificationSlice.reducer
export const { setNotifications, addNotifications, removeNotification, markAsRead } = notificationSlice.actions
