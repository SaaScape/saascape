import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoutes"
import routes from "../helpers/constants/routes"
import Dashboard from "../pages/Dashboard/DashboardContainer"
import permissions from "../helpers/constants/permissions"
import { DomainsContainer } from "../pages/Domains/DomainsContainer"
import ApplicationsContainer from "../pages/Applications/ApplicationsContainer"
import TenantsContainer from "../pages/Tenants/TenantsContainer"
import ApplicationRouteHandler from "../pages/Applications/ApplicationRouteHandler"
import ContactsContainer from "../pages/Contacts/ContactsContainer"
import ViewContactContainer from "../pages/Contacts/ViewContactContainer"
import ServersContainer from "../pages/Servers/ServersContainer"
import SettingsRouter from "../pages/Settings/SettingsRouter"
import ViewServerContainer from "../pages/Servers/ViewServerContainer"
import SettingsRouter from "../pages/Settings/SettingsRouter"
import ViewServerContainer from "../pages/Servers/ViewServerContainer"

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
        <Route path={"/applications/*"} element={<ApplicationRouteHandler />} />
      </Route>
      {/* Tenants */}
      <Route path='/tenants'>
        <Route
          path={routes.TENANTS.ALL_TENANTS}
          element={
            <ProtectedRoute
              component={<TenantsContainer />}
              permissions={[permissions.TENANTS.VIEW_TENANTS]}
            />
          }
        />
      </Route>
      <Route path='/contacts'>
        <Route
          path={routes.CONTACTS.ALL_CONTACTS}
          element={
            <ProtectedRoute
              component={<ContactsContainer />}
              permissions={[permissions.CONTACTS.VIEW_CONTACTS]}
            />
          }
        />
        <Route
          path={routes.CONTACTS.VIEW_CONTACT}
          element={
            <ProtectedRoute
              component={<ViewContactContainer />}
              permissions={[permissions.CONTACTS.VIEW_CONTACTS]}
            />
          }
        />
      </Route>
      <Route path='/servers'>
        <Route
          path={routes.SERVERS.ALL_SERVERS}
          element={
            <ProtectedRoute
              component={<ServersContainer />}
              permissions={[permissions.SERVERS.VIEW_SERVERS]}
            />
          }
        />
        <Route
          path={routes.SERVERS.VIEW_SERVER}
          element={
            <ProtectedRoute
              component={<ViewServerContainer />}
              permissions={[permissions.SERVERS.VIEW_SERVERS]}
            />
          }
        />
      </Route>
      <Route
        path={routes.SETTINGS.VIEW_SETTINGS}
        element={
          <ProtectedRoute
            component={<SettingsRouter />}
            permissions={[permissions.SETTINGS.VIEW_SETTINGS]}
          />
        }
      />
      <Route path='*' element={<div>404</div>} />
    </Routes>
  )
}

export default MainRoutes
