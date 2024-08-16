import React, { useContext, useEffect, useState } from 'react'
import ViewOvhSettings from './ViewOVHSettings.tsx'
import useSetBreadcrumbs from '../../middleware/useSetBreadcrumbs.tsx'
import breadcrumbs from '../../helpers/constants/breadcrumbs.ts'
import { useSelector } from 'react-redux'
import { IStore } from '../../store/store.ts'
import { LoadingInitialDataContext } from '../../MainLayout.tsx'
import constants from '../../helpers/constants/constants.ts'
import OVHSetupModal from '../../components/Settings/OVHSetupModal.tsx'
import { useNavigate } from 'react-router-dom'
import { apiAxios } from '../../helpers/axios.ts'

export interface ViewProps {
  isLoading: boolean
  showConfigureModal: boolean
}

function ViewOvhSettingsContainer() {
  const [loading, setLoading] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)

  const isLoadingInitialData = useContext(LoadingInitialDataContext)
  const enabledIntegrations = useSelector((state: IStore) => state.configData?.enabledIntegrations)
  const isOvhEnabled = enabledIntegrations?.[constants.INTEGRATIONS.OVH]
  const isLoading = isLoadingInitialData || loading

  const setBreadcrumbs = useSetBreadcrumbs()
  const navigate = useNavigate()

  useEffect(() => {
    setBreadcrumbs(breadcrumbs.OVH_SETTINGS)
  }, [])

  useEffect(() => {
    if (isLoadingInitialData) return
    setShowConfigureModal(!isOvhEnabled)
  }, [isLoadingInitialData, enabledIntegrations])

  const getOvhIntegration = async () => {
    const data = await apiAxios.get('/integrations/ovh')
    console.log(data)
  }

  // We will show one popup modal, asking to authenticate with OVH if no integration is configured

  const onOVHSetupModalFinish = async (values: any) => {
    console.log(values)
  }

  const onOVHSetupModalCancel = () => {
    if (isOvhEnabled) {
      return setShowConfigureModal(false)
    }

    navigate('/settings')
  }

  const viewProps: ViewProps = {
    isLoading,
    showConfigureModal,
  }

  return (
    <>
      <ViewOvhSettings {...viewProps} />
      <OVHSetupModal open={showConfigureModal} onOk={onOVHSetupModalFinish} onCancel={onOVHSetupModalCancel} />
    </>
  )
}

export default ViewOvhSettingsContainer
