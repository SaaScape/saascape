import initializeServerCrons from "../crons/serverCrons"

const handleError = (err: any) => {
  console.error("The following cron error occurred: ", err)
}

const use = (fn: Function) => {
  return async () => {
    Promise.resolve(fn()).catch(handleError)
  }
}

const initializeCrons = () => {
  initializeServerCrons(use)
  console.log("Crons have been initialized")
}

export default initializeCrons
