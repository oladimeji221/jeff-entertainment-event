import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Ticket ID is required' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { data, error } = await supabase
    .from('tickets')
    .select('ticket_id, buyer_name, buyer_email, buyer_phone, ticket_type, quantity, unit_price, total_amount, payment_status, created_at')
    .eq('ticket_id', id.toUpperCase())
    .eq('payment_status', 'paid')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Ticket not found' })

  return res.json({ ticket: data })
}
