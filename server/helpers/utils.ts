export const checkForMissingParams = (
  params: { [key: string]: any },
  requiredParams: string[]
) => {
  const missingParams = requiredParams.filter((param) => !params[param])
  if (missingParams.length > 0) {
    throw { showError: `Missing required params: ${missingParams.join(", ")}` }
  }
}
