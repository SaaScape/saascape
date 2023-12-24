import defaultAxios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
interface ApiResponse<data> extends AxiosResponse {
  success?: boolean
  data: data
}

const apiAxios = defaultAxios.create({
  baseURL: `/api`,
})
apiAxios.interceptors.response.use(
  (response: ApiResponse<any>) => response,
  (error) => {
    toast.error(error?.response?.data?.error)
    return error?.response
  }
)

const authAxios = defaultAxios.create({
  baseURL: `/auth`,
})

export { apiAxios, authAxios }
