/**
 * Script to update ticket types based on their unit prices
 * Run this once to fix existing tickets:
 * - Tickets with unit_price = 25000 → ticket_type = 'regular'
 * - Tickets with unit_price = 40000 → ticket_type = 'vip'
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load .env.local
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function updateTicketTypes() {
  console.log('🔍 Fetching all tickets...\n')

  // Get all tickets
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('ticket_id, ticket_type, unit_price, buyer_name')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching tickets:', error)
    return
  }

  if (!tickets || tickets.length === 0) {
    console.log('No tickets found.')
    return
  }

  console.log(`Found ${tickets.length} tickets\n`)

  let updatedCount = 0
  const updates = []

  // Determine what needs updating
  for (const ticket of tickets) {
    let newType = null

    if (ticket.unit_price === 25000 && ticket.ticket_type !== 'regular') {
      newType = 'regular'
    } else if (ticket.unit_price === 40000 && ticket.ticket_type !== 'vip') {
      newType = 'vip'
    }

    if (newType) {
      updates.push({
        ticket_id: ticket.ticket_id,
        old_type: ticket.ticket_type,
        new_type: newType,
        price: ticket.unit_price,
        buyer: ticket.buyer_name
      })
    }
  }

  if (updates.length === 0) {
    console.log('✅ All tickets already have correct types!')
    return
  }

  console.log(`📝 Need to update ${updates.length} tickets:\n`)
  updates.forEach(u => {
    console.log(`  ${u.ticket_id} | ${u.buyer} | ₦${u.price} | ${u.old_type} → ${u.new_type}`)
  })

  console.log('\n🚀 Updating tickets...\n')

  // Update tickets with unit_price = 25000 to 'regular'
  const { error: error1 } = await supabase
    .from('tickets')
    .update({ ticket_type: 'regular' })
    .eq('unit_price', 25000)

  if (error1) {
    console.error('❌ Error updating 25k tickets:', error1)
  } else {
    const count = updates.filter(u => u.new_type === 'regular').length
    console.log(`✅ Updated ${count} tickets (₦25,000) to 'regular'`)
  }

  // Update tickets with unit_price = 40000 to 'vip'
  const { error: error2 } = await supabase
    .from('tickets')
    .update({ ticket_type: 'vip' })
    .eq('unit_price', 40000)

  if (error2) {
    console.error('❌ Error updating 40k tickets:', error2)
  } else {
    const count = updates.filter(u => u.new_type === 'vip').length
    console.log(`✅ Updated ${count} tickets (₦40,000) to 'vip'`)
  }

  console.log('\n✅ Done!\n')
}

updateTicketTypes().catch(console.error)
