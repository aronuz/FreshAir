import nodemailer from "nodemailer"

const ADMIN_EMAIL = process.env.NUXT_GM_EMAIL
const GM_PASSWORD = process.env.NUXT_GM_PASSWORD
const GM_APP_PASSWORD = process.env.NUXT_GM_APP_PASSWORD

const transporter_up = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ADMIN_EMAIL,
    pass: GM_PASSWORD,
  },
})

const transporter_ap = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: ADMIN_EMAIL,
    pass: GM_APP_PASSWORD,
  },
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const from = `FA Contact <${ADMIN_EMAIL}>`
    try {
        const emailData = {
            subject: body.subject,
            to: ADMIN_EMAIL,
            from: from,
            // text: `${body.message}${body.email ? ' Email: '+body.email : ''}${body.phone ? ' Phone# '+body.phone : ''}`,
            html: `<div>${body.message}</div>${body.email ? '<div>Email: '+body.email+'</div>' : ''}${body.phone ? '<div>Phone# '+body.phone+'</div>' : ''}`,
        }

        const response = await transporter_ap.sendMail(emailData)

        return { success: true, data: response.messageId };
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
})

// export default SENDMAIL;