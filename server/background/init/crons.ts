/*
 * Copyright SaaScape (c) 2024.
 */

import initializeDockerCrons from '../crons/dockerCrons'
import initializeDomainCrons from '../crons/domainCrons'
import initializeServerCrons from '../crons/serverCrons'
import initializeInstanceCrons from '../crons/instanceCrons'

const handleError = (err: any) => {
  console.error('The following cron error occurred: ', err)
}

const use = (fn: Function) => async () => {
  Promise.resolve(fn()).catch(handleError)
}

const initializeCrons = () => {
  Promise.allSettled([
    initializeServerCrons(use),
    initializeDockerCrons(use),
    initializeDomainCrons(use),
    initializeInstanceCrons(use),
  ])

  console.log('Crons have been initialized')
}

export default initializeCrons
