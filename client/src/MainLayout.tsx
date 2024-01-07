import { useEffect } from "react"
import Aside from "./components/Aside"
import Header from "./components/Header"
import { apiAxios } from "./helpers/axios"
import Main from "./pages/Main"
import { useDispatch, useSelector } from "react-redux"
import { setConfigData } from "./store/slices/configData"
import axios from "axios"
import { setApplications } from "./store/slices/applicationSlice"
import socket from "./sockets/sockets"
import { IStore } from "./store/store"

const MainLayout = () => {
  const dispatch = useDispatch()
  const user = useSelector((state: IStore) => state.user)

  useEffect(() => {
    socket?.emit("authenticated", { _id: user?._id })
  }, [])

  useEffect(() => {
    Promise.allSettled([getIntegrations(), getCurrencies(), getApplications()])
  }, [])

  const getCurrencies = async () => {
    const { data } = await axios.get("/files/currency.json")
    dispatch(setConfigData({ currencies: data }))
  }

  const getIntegrations = async () => {
    const {
      data: { success, data },
    } = await apiAxios.get("/integrations")
    if (success) {
      const { integrations, enabledIntegrations } = data
      dispatch(setConfigData({ integrations, enabledIntegrations }))
    }
  }

  const getApplications = async () => {
    const {
      data: { data, success },
    } = await apiAxios.get(`/applications`)
    if (success) {
      dispatch(setApplications(data?.applications))
    }
  }

  return (
    <div className='main-layout'>
      <Header />
      <Aside />
      <Main />
    </div>
  )
}

export default MainLayout
