import { createSlice } from "@reduxjs/toolkit"

export interface INotificationState {
  _id: string
  title: string
  message: string
}

type InitialState = INotificationState | { [key: string]: any }

const initialState: InitialState = []

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotifications(state, action) {
      const { payload } = action
      state.push(...payload)
    },
    removeNotification(state, action) {
      const { payload } = action
      state = state.filter(
        (item: INotificationState) => item._id !== payload?._id
      )
    },
  },
})

export default notificationSlice.reducer
export const { addNotifications, removeNotification } =
  notificationSlice.actions
