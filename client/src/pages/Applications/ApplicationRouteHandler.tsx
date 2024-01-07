import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "../../routes/ProtectedRoutes"
import permissions from "../../helpers/constants/permissions"
import PlansContainer from "./ViewApplication/PlansContainer"
import VersionsContainer from "./ViewApplication/VersionsContainer"
import ViewApplicationContainer from "./ViewApplication/ViewApplicationContainer"
import { useEffect, useState } from "react"
import { retrieveAndSetApplications } from "../../helpers/utils"
import { Spin } from "antd"
import InstancesContainer from "./ViewApplication/InstancesContainer"
import ViewPlanContainer from "./Plan/ViewPlanContainer"

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
    <div className='d-flex justify-center m-t-20'>
      <Spin spinning={loading} tip='Loading application...' />
    </div>
  ) : (
    <Routes>
      <Route
        path={"/:id"}
        element={
          <ProtectedRoute
            component={<ViewApplicationContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={":id/plans"}
        element={
          <ProtectedRoute
            component={<PlansContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={":id/plans/:planId"}
        element={
          <ProtectedRoute
            component={<ViewPlanContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={":id/versions"}
        element={
          <ProtectedRoute
            component={<VersionsContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
      <Route
        path={":id/instances"}
        element={
          <ProtectedRoute
            component={<InstancesContainer {...allProps} />}
            permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
          />
        }
      />
    </Routes>
  )
}

export default ApplicationRouteHandler
