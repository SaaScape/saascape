import { configureStore } from "@reduxjs/toolkit"
import usersReducer, { IUserState } from "./slices/userSlice"

export interface IStore {
  user: IUserState
}

export const store = configureStore({
  reducer: {
    user: usersReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
