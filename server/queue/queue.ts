import Bull from 'bull'

export const addTaskToQueue = (queueName: string, data: any) => {
  const { BULL_PREFIX, REDIS_URL } = process.env
  const queue = new Bull(`${BULL_PREFIX}_${queueName}`, REDIS_URL || '')
  return queue.add(data)
}

export const getQueue = (queueName: string) => {
  const { BULL_PREFIX, REDIS_URL } = process.env
  return new Bull(`${BULL_PREFIX}_${queueName}`, REDIS_URL || '')
}
