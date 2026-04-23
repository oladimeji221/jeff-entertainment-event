// Run once: node scripts/setup-db.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://obkbzxjhktszdaucpsmd.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ia2J6eGpoa3RzemRhdWNwc21kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjgwMjI2OCwiZXhwIjoyMDkyMzc4MjY4fQ.RWCkyinXzppAYa0fZl6lHW_D7Zua9tqFIgNv_APkd6A'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const sql = `
CREATE TABLE IF NOT EXISTS tickets (
  id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id           VARCHAR(20)   UNIQUE NOT NULL,
  buyer_name          VARCHAR(255)  NOT NULL,
  buyer_email         VARCHAR(255)  NOT NULL,
  buyer_phone         VARCHAR(50)   DEFAULT '',
  ticket_type         VARCHAR(10)   NOT NULL CHECK (ticket_type IN ('regular', 'vip', 'vvip')),
  quantity            INTEGER       NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price          NUMERIC(12,2) NOT NULL,
  total_amount        NUMERIC(12,2) NOT NULL,
  paystack_reference  VARCHAR(100)  UNIQUE NOT NULL,
  payment_status      VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  is_scanned          BOOLEAN       NOT NULL DEFAULT FALSE,
  scanned_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tickets_ticket_id_idx ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS tickets_paystack_ref_idx ON tickets(paystack_reference);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own ticket" ON tickets;
CREATE POLICY "read own ticket" ON tickets FOR SELECT USING (true);
`

// Use Supabase's pg endpoint to run DDL
const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ sql })
})

if (res.ok) {
  console.log('✅ Database schema created successfully!')
} else {
  const body = await res.text()
  // exec_sql not available — that's fine, use dashboard instead
  if (body.includes('exec_sql') || body.includes('not exist') || res.status === 404) {
    console.log('ℹ️  Direct SQL not available via REST API.')
    console.log('')
    console.log('👉 Please run the schema manually in the Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/obkbzxjhktszdaucpsmd/sql/new')
    console.log('')
    console.log('   Paste the contents of: supabase-schema.sql')
    console.log('')
    console.log('   (This is a one-time step — takes 30 seconds)')
  } else {
    console.error('❌ Error:', res.status, body)
  }
}

// Verify connection works by trying to count tickets
const { count, error } = await supabase.from('tickets').select('*', { count: 'exact', head: true })
if (error && error.code === '42P01') {
  console.log('⚠️  Table does not exist yet — please run the SQL in the dashboard.')
} else if (!error) {
  console.log(`✅ Connected! Tickets table exists (${count ?? 0} records).`)
}
