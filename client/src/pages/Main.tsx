import { Breadcrumb } from "antd"
import MainRoutes from "../routes/MainRoutes"
import { IStore } from "../store/store"
import { useSelector } from "react-redux"

const Main = () => {
  const breadcrumbs = useSelector((state: IStore) => state.breadcrumbs)

  return (
    <main>
      <Breadcrumb items={breadcrumbs} />
      <MainRoutes />
    </main>
  )
}

export default Main
