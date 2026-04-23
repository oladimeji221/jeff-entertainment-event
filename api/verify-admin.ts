import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password } = req.body
  const secret = process.env.ADMIN_SECRET

  if (!secret || !password) return res.status(400).json({ ok: false })

  const isValid = crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(secret)
  )

  if (!isValid) return res.status(401).json({ ok: false })

  // Generate a time-limited token: timestamp:HMAC(timestamp, secret)
  const timestamp = String(Date.now())
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  const token = `${timestamp}:${hmac}`

  return res.json({ ok: true, token })
}
