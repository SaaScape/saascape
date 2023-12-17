import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoutes"
import routes from "../helpers/constants/routes"
import Dashboard from "../pages/Dashboard/DashboardContainer"
import permissions from "../helpers/constants/permissions"
import { DomainsContainer } from "../pages/Domains/DomainsContainer"

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
      <Route path='/domains'>
        <Route
          path={routes.DOMAINS.ALL_DOMAINS}
          element={<ProtectedRoute component={<DomainsContainer />} />}
        />
      </Route>
      <Route path='*' element={<div>404</div>} />
    </Routes>
  )
}

export default MainRoutes
