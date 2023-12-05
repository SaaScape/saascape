import { useDispatch } from "react-redux"
import { authAxios } from "../helpers/axios"
import { initializeUser } from "../store/slices/userSlice"

interface IData {
  setIsAuthenticated: Function
  setCheckedAuth: Function
}

const useCheckAuth = () => {
  const dispatch = useDispatch()

  return async (data: IData) => {
    const { setIsAuthenticated } = data

    try {
      const { refreshToken } = localStorage
      if (!refreshToken) {
        setIsAuthenticated(false)
        return { success: false }
      }
      const {
        data: { data, success },
      } = await authAxios.get("/check-auth")

      if (!success) throw new Error("Not successful")

      const { userObj, permissions } = data

      dispatch(initializeUser({ ...userObj, permissions }))
      setIsAuthenticated(success)
      return { success }
    } catch (err) {
      console.warn(err)
      dispatch(initializeUser({}))
      setIsAuthenticated(false)
      return { success: false }
    }
  }
}

export default useCheckAuth
