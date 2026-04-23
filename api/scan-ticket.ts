import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET!
  // Token format: timestamp:hmac — valid for 24 hours
  const [timestamp, hmac] = token.split(':')
  if (!timestamp || !hmac) return false
  if (Date.now() - parseInt(timestamp) > 86400000) return false
  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers['x-admin-token'] as string
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { ticketId } = req.body
  if (!ticketId) return res.status(400).json({ error: 'ticketId is required' })

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', String(ticketId).toUpperCase())
    .eq('payment_status', 'paid')
    .single()

  if (error || !ticket) {
    return res.status(404).json({ error: 'Ticket not found or payment not confirmed' })
  }

  if (ticket.is_scanned) {
    return res.status(409).json({ error: 'already_scanned', ticket })
  }

  // Mark as scanned
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ is_scanned: true, scanned_at: new Date().toISOString() })
    .eq('ticket_id', ticket.ticket_id)

  if (updateError) {
    console.error('Scan update error:', updateError)
    return res.status(500).json({ error: 'Failed to mark ticket as scanned' })
  }

  return res.json({ ticket: { ...ticket, is_scanned: true } })
}
