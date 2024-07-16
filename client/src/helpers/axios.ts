/*
 * Copyright SaaScape (c) 2024.
 */

import defaultAxios, { AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
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
  },
)

const apiAxiosClean = defaultAxios.create({ baseURL: `/api` })
apiAxiosClean.interceptors.response.use(
  (response: ApiResponse<any>) => response,
  (error) => {
    return error?.response
  },
)

const authAxios = defaultAxios.create({
  baseURL: `/auth`,
})

const apiAxiosToast = (toastId: any) => {
  const apiAxios = defaultAxios.create({
    baseURL: `/api`,
  })

  apiAxios.interceptors.response.use(
    (response: ApiResponse<any>) => response,
    (error) => {
      toast.update(toastId, {
        type: 'error',
        render: error?.response?.data?.error,
        isLoading: false,
        autoClose: 3000,
      })
      return error?.response
    },
  )

  return apiAxios
}

export { apiAxios, apiAxiosClean, authAxios, apiAxiosToast }
