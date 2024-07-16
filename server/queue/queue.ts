import Bull from "bull"

export const addTaskToQueue = (queueName: string, data: any) => {
  const { BULL_PREFIX } = process.env
  const queue = new Bull(`${BULL_PREFIX}_${queueName}`)
  return queue.add(data)
}

export const getQueue = (queueName: string) => {
  const { BULL_PREFIX } = process.env
  return new Bull(`${BULL_PREFIX}_${queueName}`)
}
