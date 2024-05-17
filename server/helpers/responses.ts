/*
 * Copyright SaaScape (c) 2024.
 */

import { Request, Response } from 'express'
import moment from 'moment'
import IError from '../interfaces/error'

export const sendErrorResponse = async (err: IError, req: Request, res: Response) => {
  try {
    const { status = 404 } = err
    const errorMessage = err?.message || err?.showError || err?.showWarning || 'An unknown error occurred'
    const formattedDate = moment().format('DD-MM-YYYY HH:mm:ss')
    const statusType = err?.message || err?.showError ? 'error' : 'warning'

    console.log(`API ${statusType} occurred - ${formattedDate} - ${errorMessage}`)
    console.log(err)

    const responseObj: { error?: string; warning?: string; success: boolean } = { success: false }

    if (err.showError) {
      responseObj.error = err.showError
    } else if (err.showWarning) {
      responseObj.warning = err.showWarning
    } else {
      responseObj.error = 'An unexpected error has occurred!'
    }
    res.status(status).json(responseObj)
  } catch (err) {
    console.warn(err)
  }
}

export const sendSuccessResponse = async (data: any, req: Request, res: Response) => {
  try {
    res.json({ data, success: true })
  } catch (err) {
    console.warn(err)
  }
}
