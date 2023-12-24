export const buildQueryParams = (queryParams: {
  [key: string]: string | number
}) => {
  return `?${Object.entries(queryParams)
    .map((param) => `${param[0]}=${param[1]}`)
    .join("&")}`
}
