/*
 * Copyright SaaScape (c) 2024.
 */

import { createContext, useEffect, useState } from 'react'
import Aside from './components/Aside'
import Header from './components/Header'
import { apiAxios } from './helpers/axios'
import Main from './pages/Main'
import { useDispatch } from 'react-redux'
import { setConfigData } from './store/slices/configData'
import axios from 'axios'
import { setApplications } from './store/slices/applicationSlice'
import { setServers } from './store/slices/serverSlice'
import { setSwarms } from './store/slices/swarmSlice'
import ManageInstances from './components/InstanceManager.tsx'
import { setNotifications } from './store/slices/notificationsSlice.ts'

export const LoadingInitialDataContext = createContext(true)

const MainLayout = () => {
  const dispatch = useDispatch()
  // const user = useSelector((state: IStore) => state.user)
  const [loadingInitialData, setLoadingInitialData] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      setLoadingInitialData(true)
      await Promise.allSettled([
        getIntegrations(),
        getCurrencies(),
        getApplications(),
        getServers(),
        getSwarms(),
        getNotifications(),
      ])
      setLoadingInitialData(false)
    })()
  }, [])

  const getCurrencies = async () => {
    const { data } = await axios.get('/files/currency.json')
    dispatch(setConfigData({ currencies: data }))
  }

  const getIntegrations = async () => {
    const {
      data: { success, data },
    } = await apiAxios.get('/integrations')
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

  const getServers = async () => {
    const {
      data: { data, success },
    } = await apiAxios.get('/servers')

    if (success) {
      dispatch(setServers(data?.servers))
    }
  }

  const getSwarms = async () => {
    const {
      data: { data, success },
    } = await apiAxios.get('/servers/swarms')
    if (success) {
      dispatch(setSwarms(data?.swarms))
    }
  }

  const getNotifications = async () => {
    const {
      data: { data, success },
    } = await apiAxios.get('/notifications')
    if (success) {
      dispatch(setNotifications(data))
    }
  }

  return (
    <LoadingInitialDataContext.Provider value={loadingInitialData}>
      <ManageInstances>
        <div className="main-layout">
          <Header />
          <Aside />
          <Main />
        </div>
      </ManageInstances>
    </LoadingInitialDataContext.Provider>
  )
}

export default MainLayout
