/**
 * Recovery script — finds recent successful Paystack payments that
 * don't have a ticket in the database, and creates them.
 *
 * Run: node scripts/recover-tickets.mjs
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const PAYSTACK_SECRET  = env.PAYSTACK_SECRET_KEY
const SUPABASE_URL     = env.VITE_SUPABASE_URL
const SUPABASE_SERVICE = env.SUPABASE_SERVICE_KEY

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function generateTicketId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'JE-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

console.log('🔍  Fetching recent Paystack transactions...\n')

const res = await fetch('https://api.paystack.co/transaction?status=success&perPage=20', {
  headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
})
const { data: transactions } = await res.json()

if (!transactions?.length) {
  console.log('No successful transactions found.')
  process.exit(0)
}

let created = 0
let skipped = 0

for (const tx of transactions) {
  // Check if ticket already exists
  const { data: existing } = await db.from('tickets').select('ticket_id')
    .eq('paystack_reference', tx.reference).single()

  if (existing) {
    console.log(`✅  Already has ticket: ${existing.ticket_id}  (ref: ${tx.reference})`)
    skipped++
    continue
  }

  // Generate unique ticket ID
  let ticketId = ''
  for (let i = 0; i < 5; i++) {
    const c = generateTicketId()
    const { data } = await db.from('tickets').select('ticket_id').eq('ticket_id', c).single()
    if (!data) { ticketId = c; break }
  }

  const fields = tx.metadata?.custom_fields ?? []
  const meta = {}
  fields.forEach(f => { meta[f.variable_name] = f.value })

  const qty = parseInt(meta.quantity ?? '1') || 1
  const ticketType = meta.ticket_type ?? 'regular'

  const { error } = await db.from('tickets').insert({
    ticket_id: ticketId,
    buyer_name: meta.buyer_name || tx.customer?.first_name || 'Guest',
    buyer_email: tx.customer?.email ?? '',
    buyer_phone: meta.buyer_phone ?? '',
    ticket_type: ticketType,
    quantity: qty,
    unit_price: (tx.amount / 100) / qty,
    total_amount: tx.amount / 100,
    paystack_reference: tx.reference,
    payment_status: 'paid',
  })

  if (error) {
    console.error(`❌  Failed to create ticket for ref ${tx.reference}:`, error.message)
  } else {
    console.log(`🎟️  Created ticket: ${ticketId}`)
    console.log(`     Name:   ${meta.buyer_name || tx.customer?.first_name || 'Guest'}`)
    console.log(`     Email:  ${tx.customer?.email}`)
    console.log(`     Type:   ${ticketType} × ${qty}`)
    console.log(`     Amount: ₦${(tx.amount / 100).toLocaleString()}`)
    console.log(`     URL:    http://localhost:5173/ticket/${ticketId}`)
    console.log()
    created++
  }
}

console.log(`\n✅  Done. Created ${created} ticket(s), skipped ${skipped} already processed.`)
