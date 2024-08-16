import { Route, Routes } from 'react-router-dom'
import ViewSettingsContainer from './ViewSettingsContainer'
import ViewDockerSettingsContainer from './ViewDockerSettingsContainer'
import routes from '../../helpers/constants/routes'
import ViewOVHSettingsContainer from './ViewOVHSettingsContainer.tsx'

const SettingsRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ViewSettingsContainer />} />
      <Route path={routes.SETTINGS.DOCKER} element={<ViewDockerSettingsContainer />} />{' '}
      <Route path={routes.SETTINGS.OVH} element={<ViewOVHSettingsContainer />} />
      <Route path="*" element={<div>Settings not found</div>} />
    </Routes>
  )
}

export default SettingsRouter
