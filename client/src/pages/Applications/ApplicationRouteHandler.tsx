import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../../routes/ProtectedRoutes'
import permissions from '../../helpers/constants/permissions'
import PlansContainer from './ViewApplication/PlansContainer'
import VersionsContainer from './ViewApplication/VersionsContainer'
import ViewApplicationContainer from './ViewApplication/ViewApplicationContainer'
import { useEffect, useState } from 'react'
import { retrieveAndSetApplications } from '../../helpers/utils'
import { Spin } from 'antd'
import InstancesContainer from './ViewApplication/InstancesContainer'
import ViewPlanContainer from './Plan/ViewPlanContainer'
import ConfigurationContainer from './ViewApplication/ConfigurationContainer'
import ViewInstanceContainer from './ViewApplication/ViewInstanceContainer'
import DeploymentsContainer from './Deployments/DeploymentsContainer.tsx'
import ViewDeploymentContainer from './Deployments/ViewDeploymentContainer.tsx'

export interface IApplicationProps {
  setId: (id?: string) => void
}

const ApplicationRouteHandler = () => {
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<string | undefined>()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    retrieveAndSetApplications(id)
    setLoading(false)
  }, [id])

  const allProps: IApplicationProps = {
    setId,
  }

  return loading ? (
    <div className="d-flex justify-center m-t-20">
      <Spin spinning={loading} tip="Loading application..." />
    </div>
  ) : (
    <Routes>
      <Route
        path={'/:id'}
        element={
          <ProtectedRoute
            component={<ViewApplicationContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/plans'}
        element={
          <ProtectedRoute
            component={<PlansContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/plans/:planId'}
        element={
          <ProtectedRoute
            component={<ViewPlanContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/versions'}
        element={
          <ProtectedRoute
            component={<VersionsContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/instances'}
        element={
          <ProtectedRoute
            component={<InstancesContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/instances/:instanceId'}
        element={
          <ProtectedRoute
            component={<ViewInstanceContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/deployments/'}
        element={
          <ProtectedRoute
            component={<DeploymentsContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/deployments/:deploymentId'}
        element={
          <ProtectedRoute
            component={<ViewDeploymentContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={':id/configuration'}
        element={
          <ProtectedRoute
            component={<ConfigurationContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.UPDATE_APPLICATIONS]}
          />
        }
      />
    </Routes>
  )
}

export default ApplicationRouteHandler
