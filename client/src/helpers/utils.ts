import {
  IApplication,
  setApplications,
  setSelectedApplication,
} from "../store/slices/applicationSlice"
import { store } from "../store/store"
import { apiAxios } from "./axios"

export const queryParamBuilder = (query: {
  [key: string]: string | undefined
}) => {
  return `?${Object.entries(query)
    .map((param) => `${param[0]}=${param[1]}`)
    .join("&")}`
}

export const retrieveAndSetApplications = async (applicationId: string) => {
  if (!applicationId) return
  const foundAppCached = store
    .getState()
    .applications?.applications?.find(
      (app: IApplication) => app._id === applicationId
    )
  if (foundAppCached) {
    store.dispatch(setSelectedApplication(foundAppCached))
    console.log("found cached app")
    return
  }
  console.log("searching through api")
  const {
    data: { data, success },
  } = await apiAxios.get(`/applications`)
  if (success) {
    store.dispatch(setApplications(data?.applications))
    store.dispatch(
      setSelectedApplication(
        data?.applications.find(
          (app: IApplication) => app._id === applicationId
        )
      )
    )
  }
  return data || []
}
