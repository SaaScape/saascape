/*
 * Copyright SaaScape (c) 2024.
 */

import Bull from 'bull'
import initializeServerWorkers from './serverWorkers'
import initializeDomainWorkers from './domainWorkers'
import initializeInstanceWorkers from './instanceWorkers'

export interface IWorker {
  worker: (job: Bull.Job) => void
  onComplete: (job: Bull.Job) => void
  onFailed?: (job: Bull.Job) => void
}

export const defaultOnFailed = (job: Bull.Job) => {
  console.log('Job failed', job.id)
}

const initializeWorkers = async () => {
  await Promise.all([initializeServerWorkers(), initializeDomainWorkers(), initializeInstanceWorkers()])
  console.log('Workers initialized successfully!')
}

export default initializeWorkers
