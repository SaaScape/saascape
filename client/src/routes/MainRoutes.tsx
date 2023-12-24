import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoutes"
import routes from "../helpers/constants/routes"
import Dashboard from "../pages/Dashboard/DashboardContainer"
import permissions from "../helpers/constants/permissions"
import { DomainsContainer } from "../pages/Domains/DomainsContainer"
import ApplicationsContainer from "../pages/Applications/ApplicationsContainer"

const MainRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      {/* Users */}
      <Route path='/users'>
        <Route
          path={routes.USERS.ALL_USERS}
          element={<ProtectedRoute component={<div>all users</div>} />}
        />
        <Route
          path={routes.USERS.VIEW_USER}
          element={
            <ProtectedRoute
              component={<div>Hey user id</div>}
              permissions={[permissions.SUPER_ACCESS]}
            />
          }
        />
      </Route>
      {/* Domains */}
      <Route path='/domains'>
        <Route
          path={routes.DOMAINS.ALL_DOMAINS}
          element={<ProtectedRoute component={<DomainsContainer />} />}
        />
      </Route>
      {/* Applications */}
      <Route path='/applications'>
        <Route
          path={routes.APPLICATIONS.ALL_APPLICATIONS}
          element={
            <ProtectedRoute
              component={<ApplicationsContainer />}
              permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
            />
          }
        />
        <Route
          path={routes.APPLICATIONS.VIEW_APPLICATION}
          element={
            <ProtectedRoute
              component={<div>Hey application id</div>}
              permissions={[permissions.APPLICATIONS.VIEW_APPLICATIONS]}
            />
          }
        />
      </Route>
      <Route path='*' element={<div>404</div>} />
    </Routes>
  )
}

export default MainRoutes
