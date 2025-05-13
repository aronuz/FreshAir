import axios from "axios";

const CLIENT_ID = process.env.NUXT_SP_USER_ID!
const CLIENT_SECRET = process.env.NUXT_SP_API_SECRET!
const ADMIN_EMAIL = process.env.NUXT_EMAIL!

const getAccessToken = async () => {
    const { data } = await axios.post("https://api.sendpulse.com/oauth/access_token", {
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    })
    return data.access_token
};

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    try {
        const ACCESS_TOKEN = await getAccessToken();

        const emailData = {
            email: {
                subject: body.subject,
                to: { name: "Admin", email: ADMIN_EMAIL },
                from: [{ email: body.email, name: body.name }],
                body: `<h1>${body.message}</h1>`,
            },
        }

        const response = await axios.post("https://api.sendpulse.com/smtp/emails", emailData, {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        })

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data || error.message }
    }
})
