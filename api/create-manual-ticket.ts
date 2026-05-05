import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'JE-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET!
  // Token format: timestamp:hmac — valid for 24 hours
  const [timestamp, hmac] = token.split(':')
  if (!timestamp || !hmac) return false
  if (Date.now() - parseInt(timestamp) > 86400000) return false
  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Verify admin token
  const token = req.headers['x-admin-token'] as string
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { buyer_name, buyer_email, buyer_phone, ticket_type, quantity, unit_price } = req.body

  // Validate required fields
  if (!buyer_name || !buyer_email || !ticket_type || !quantity || !unit_price) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Validate ticket type
  if (!['regular', 'vip', 'vvip'].includes(ticket_type)) {
    return res.status(400).json({ error: 'Invalid ticket type' })
  }

  // Validate quantity
  const qty = parseInt(quantity)
  if (isNaN(qty) || qty < 1) {
    return res.status(400).json({ error: 'Invalid quantity' })
  }

  // Validate unit price
  const price = parseFloat(unit_price)
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  // Generate unique ticket ID (retry if collision)
  let ticketId = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateTicketId()
    const { data } = await supabase.from('tickets').select('ticket_id').eq('ticket_id', candidate).single()
    if (!data) { ticketId = candidate; break }
  }
  if (!ticketId) return res.status(500).json({ error: 'Could not generate ticket ID' })

  const total = price * qty

  // Generate a unique reference for manual tickets
  const manualReference = `MANUAL-${ticketId}-${Date.now()}`

  const { error } = await supabase.from('tickets').insert({
    ticket_id: ticketId,
    buyer_name,
    buyer_email,
    buyer_phone: buyer_phone || '',
    ticket_type,
    quantity: qty,
    unit_price: price,
    total_amount: total,
    paystack_reference: manualReference,
    payment_status: 'paid',
  })

  if (error) {
    console.error('DB insert error:', error)
    return res.status(500).json({ error: 'Failed to save ticket' })
  }

  return res.json({ ticketId })
}
