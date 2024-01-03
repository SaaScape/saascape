import MainRoutes from "../routes/MainRoutes"
import { IStore } from "../store/store"
import { useSelector } from "react-redux"
import Breadcrumbs from "../components/Breadcrumbs"

const Main = () => {
  const breadcrumbs = useSelector((state: IStore) => state.breadcrumbs)
  const layoutConfig = useSelector((state: IStore) => state.layoutConfig)
  const { showBreadcrumbs } = layoutConfig

  return (
    <main>
      {showBreadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <MainRoutes />
    </main>
  )
}

export default Main
