import { configureStore } from "@reduxjs/toolkit"
import usersReducer, { IUserState } from "./slices/userSlice"
import notificationsReducer, {
  INotificationState,
} from "./slices/notificationsSlice"
import configDataReducer, { IConfigData } from "./slices/configData"
import breadcrumbsReducer, { IBreadcrumbs } from "./slices/breadcrumbs"

export interface IStore {
  user: IUserState
  notifications: INotificationState[]
  configData: IConfigData
  breadcrumbs: IBreadcrumbs[]
}

export const store = configureStore({
  reducer: {
    user: usersReducer,
    notifications: notificationsReducer,
    configData: configDataReducer,
    breadcrumbs: breadcrumbsReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
