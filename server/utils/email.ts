import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const config = useRuntimeConfig()

  const port = parseInt(config.smtpPort as string) || 465

  const transporter = nodemailer.createTransport({
    host: config.smtpHost as string,
    port,
    secure: port === 465,
    auth: {
      user: config.smtpUser as string,
      pass: config.smtpPass as string,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  try {
    await transporter.sendMail({
      from: (config.smtpFrom as string) || 'Lakara <noreply@lakara.id>',
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('[Lakara email] Failed to send to', to, ':', err)
    return false
  }
}
