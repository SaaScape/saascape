import { useDispatch } from "react-redux"
import { IBreadcrumbs, setBreadcrumbs } from "../store/slices/breadcrumbs"

const useSetBreadcrumbs = () => {
  const dispatch = useDispatch()

  const handleSetBreadcrumbs = (breadcrumbs: IBreadcrumbs[]) => {
    dispatch(setBreadcrumbs(breadcrumbs))
  }

  return handleSetBreadcrumbs
}

export default useSetBreadcrumbs
