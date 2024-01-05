export const queryParamBuilder = (query: {
  [key: string]: string | undefined
}) => {
  return `?${Object.entries(query)
    .map((param) => `${param[0]}=${param[1]}`)
    .join("&")}`
}
