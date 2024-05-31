/*
 * Copyright SaaScape (c) 2024.
 */

import { useEffect } from 'react'
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

const MainLayout = () => {
  const dispatch = useDispatch()
  // const user = useSelector((state: IStore) => state.user)

  useEffect(() => {
    Promise.allSettled([getIntegrations(), getCurrencies(), getApplications(), getServers(), getSwarms()])
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

  return (
    <ManageInstances>
      <div className="main-layout">
        <Header />
        <Aside />
        <Main />
      </div>
    </ManageInstances>
  )
}

export default MainLayout
