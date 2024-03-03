import initializeDockerCrons from "../crons/dockerCrons"
import initializeDomainCrons from "../crons/domainCrons"
import initializeServerCrons from "../crons/serverCrons"

const handleError = (err: any) => {
  console.error("The following cron error occurred: ", err)
}

const use = (fn: Function) => async () => {
  Promise.resolve(fn()).catch(handleError)
}

const initializeCrons = () => {
  Promise.allSettled([
    initializeServerCrons(use),
    initializeDockerCrons(use),
    initializeDomainCrons(use),
  ])

  console.log("Crons have been initialized")
}

export default initializeCrons
