import defaultAxios from "axios"

export const apiAxios = defaultAxios.create({
  baseURL: `/api`,
})
export const authAxios = defaultAxios.create({
  baseURL: `/auth`,
})
