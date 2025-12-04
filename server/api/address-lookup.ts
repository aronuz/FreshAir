import { createError } from 'h3'

const API_Key = process.env.GEOC_API_KEY || ''

export default defineEventHandler(async (event) => {
  try {
    // Only allow POST
    const method = (event.node.req.method || '').toUpperCase()
    if (method !== 'POST') {
      throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    const body = await readBody(event)

    if (!API_Key) {
      // Log for server-side visibility
      console.error('address-lookup: missing GEOC_API_KEY')
      throw createError({ statusCode: 500, statusMessage: 'Server: missing GEOC_API_KEY' })
    }

    const address = body?.address
    if (!address) {
      throw createError({ statusCode: 400, statusMessage: 'Request must include `address` in body' })
    }

    const limitQuery = body?.limit ? `limit=${body.limit}&` : ''
    const url = `https://api.geocod.io/v1.9/geocode?q=${encodeURIComponent(address)}&${limitQuery}api_key=${API_Key}`

    const response = await fetch(url)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('address-lookup: upstream error', response.status, text)
      throw createError({ statusCode: 502, statusMessage: `Geocod.io error: ${response.status} ${text}` })
    }

    const data = await response.json()
    return { success: true, data }
  } catch (err: any) {
    // If it's already a createError (has statusCode), rethrow so Nuxt handles it
    console.error('address-lookup handler error:', err)
    if (err && err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: String(err?.message || err) })
  }
})
