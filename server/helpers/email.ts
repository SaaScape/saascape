/*
 * Copyright SaaScape (c) 2024.
 */

import nodemailer from 'nodemailer'

interface ISendMail {
  to?: string
  bcc?: string
  subject: string
  html: string
}

const { EMAIL_365_HOST, EMAIL_365_PORT, EMAIL_365_SECURE, EMAIL_365_USER, EMAIL_365_PASS } = process.env

const transporter = nodemailer.createTransport({
  host: EMAIL_365_HOST,
  port: Number(EMAIL_365_PORT),
  secure: Number(EMAIL_365_SECURE) === 1,
  auth: {
    user: EMAIL_365_USER,
    pass: EMAIL_365_PASS,
  },
})

export const sendEmail = async (options: ISendMail) => {
  const { to, subject, html, bcc } = options

  const mailOptions = {
    from: EMAIL_365_USER,
    to,
    bcc,
    subject,
    html,
  }
  const sendResult = await transporter.sendMail(mailOptions).catch((err) => {
    console.error('Error sending email', err)
    return false
  })

  return sendResult
}
