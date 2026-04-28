import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function generateTicketId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'JE-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { reference } = req.body
  if (!reference) return res.status(400).json({ error: 'Reference is required' })

  // Verify with Paystack
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  )
  const ps = await paystackRes.json()

  if (!ps.status || ps.data?.status !== 'success') {
    return res.status(400).json({ error: 'Payment not successful' })
  }

  const tx = ps.data
  const fields = (tx.metadata?.custom_fields ?? []) as Array<{ variable_name: string; value: string }>
  const meta: Record<string, string> = {}
  fields.forEach((f) => { meta[f.variable_name] = f.value })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  // Idempotency — return existing ticket if already processed
  const { data: existing } = await supabase
    .from('tickets')
    .select('ticket_id')
    .eq('paystack_reference', reference)
    .single()

  if (existing) return res.json({ ticketId: existing.ticket_id })

  // Generate unique ticket ID (retry if collision)
  let ticketId = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateTicketId()
    const { data } = await supabase.from('tickets').select('ticket_id').eq('ticket_id', candidate).single()
    if (!data) { ticketId = candidate; break }
  }
  if (!ticketId) return res.status(500).json({ error: 'Could not generate ticket ID' })

  const qty = parseInt(meta.quantity ?? '1') || 1

  const { error } = await supabase.from('tickets').insert({
    ticket_id: ticketId,
    buyer_name: meta.buyer_name || tx.customer?.first_name || 'Guest',
    buyer_email: tx.customer?.email ?? '',
    buyer_phone: meta.buyer_phone ?? '',
    ticket_type: meta.ticket_type ?? 'regular',
    quantity: qty,
    unit_price: (tx.amount / 100) / qty,
    total_amount: tx.amount / 100,
    paystack_reference: reference,
    payment_status: 'paid',
  })

  if (error) {
    console.error('DB insert error:', error)
    return res.status(500).json({ error: 'Failed to save ticket' })
  }

  return res.json({ ticketId })
}
