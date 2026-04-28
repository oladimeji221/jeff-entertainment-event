import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

function verifyToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret || !token) return false
  const [ts, hmac] = token.split(':')
  if (!ts || !hmac) return false
  if (Date.now() - parseInt(ts) > 86400000) return false
  const expected = crypto.createHmac('sha256', secret).update(ts).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['x-admin-token'] as string | undefined
  if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: 'DB error' })
  return res.status(200).json({ tickets: data })
}
