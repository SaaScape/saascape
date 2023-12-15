import { configureStore } from "@reduxjs/toolkit"
import usersReducer, { IUserState } from "./slices/userSlice"
import notificationsReducer, {
  INotificationState,
} from "./slices/notificationsSlice"

export interface IStore {
  user: IUserState
  notifications: INotificationState[]
}

export const store = configureStore({
  reducer: {
    user: usersReducer,
    notifications: notificationsReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
