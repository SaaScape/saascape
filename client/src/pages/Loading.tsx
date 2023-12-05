import { useDispatch } from "react-redux"
import useCheckAuth from "../middleware/useCheckAuth"
import { useEffect } from "react"
import { authAxios } from "../helpers/axios"
import { initializeUser } from "../store/slices/userSlice"

interface IProps {
  setIsAuthenticated: Function
  setCheckedAuth: Function
}

const Loading = (props: IProps) => {
  const { setIsAuthenticated, setCheckedAuth } = props
  const checkAuth = useCheckAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    ;(async () => {
      try {
        const { success } = await checkAuth({
          setIsAuthenticated,
          setCheckedAuth,
        })
        if (!success) {
          // if not checkAuth ok, attempt refresh login
          const { refreshToken } = localStorage
          if (!refreshToken) return setCheckedAuth(true)
          const {
            data: {
              success,
              data: { userAccount, permissions },
            },
          } = await authAxios.post("/token-login", { refreshToken })

          if (success) {
            dispatch(initializeUser({ ...userAccount, permissions }))
          }
          setIsAuthenticated(success)
        }
        setCheckedAuth(true)
      } catch (err) {
        console.warn(err)
        setIsAuthenticated(false)
        setCheckedAuth(true)
      }
    })()
  }, [])
  return <div>Loading</div>
}

export default Loading
