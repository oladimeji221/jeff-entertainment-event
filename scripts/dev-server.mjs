/**
 * Local dev API server — mirrors the Vercel serverless functions.
 * Run alongside Vite: npm run dev:api
 */
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

// Load .env.local
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = {}
for (const line of envFile.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const PAYSTACK_SECRET  = env.PAYSTACK_SECRET_KEY
const SUPABASE_URL     = env.VITE_SUPABASE_URL
const SUPABASE_SERVICE = env.SUPABASE_SERVICE_KEY
const ADMIN_SECRET     = env.ADMIN_SECRET
const PORT             = 3001

// ── Helpers ───────────────────────────────────────────────────────────────────

function supabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function generateTicketId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'JE-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function generateToken() {
  const ts = String(Date.now())
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(ts).digest('hex')
  return `${ts}:${hmac}`
}

function verifyToken(token) {
  const [ts, hmac] = (token || '').split(':')
  if (!ts || !hmac) return false
  if (Date.now() - parseInt(ts) > 86400000) return false
  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(ts).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', c => { data += c })
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  res.end(json)
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleVerifyPayment(req, res) {
  const { reference } = await readBody(req)
  if (!reference) return send(res, 400, { error: 'Reference required' })

  const ps = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  ).then(r => r.json())

  if (!ps.status || ps.data?.status !== 'success')
    return send(res, 400, { error: 'Payment not successful' })

  const tx = ps.data
  const fields = tx.metadata?.custom_fields ?? []
  const meta = {}
  fields.forEach(f => { meta[f.variable_name] = f.value })

  const db = supabase()

  // Idempotency
  const { data: existing } = await db.from('tickets').select('ticket_id').eq('paystack_reference', reference).single()
  if (existing) return send(res, 200, { ticketId: existing.ticket_id })

  // New ticket
  let ticketId = ''
  for (let i = 0; i < 5; i++) {
    const c = generateTicketId()
    const { data } = await db.from('tickets').select('ticket_id').eq('ticket_id', c).single()
    if (!data) { ticketId = c; break }
  }
  if (!ticketId) return send(res, 500, { error: 'Could not generate ticket ID' })

  const qty = parseInt(meta.quantity ?? '1') || 1
  const { error } = await db.from('tickets').insert({
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

  if (error) { console.error('DB error:', error); return send(res, 500, { error: 'DB insert failed' }) }
  return send(res, 200, { ticketId })
}

async function handleGetTicket(req, res, query) {
  const id = new URLSearchParams(query).get('id')
  if (!id) return send(res, 400, { error: 'ID required' })

  const { data, error } = await supabase()
    .from('tickets')
    .select('ticket_id,buyer_name,buyer_email,buyer_phone,ticket_type,quantity,unit_price,total_amount,payment_status,created_at')
    .eq('ticket_id', id.toUpperCase())
    .eq('payment_status', 'paid')
    .single()

  if (error || !data) return send(res, 404, { error: 'Ticket not found' })
  return send(res, 200, { ticket: data })
}

async function handleScanTicket(req, res) {
  const token = req.headers['x-admin-token']
  if (!verifyToken(token)) return send(res, 401, { error: 'Unauthorized' })

  const { ticketId } = await readBody(req)
  if (!ticketId) return send(res, 400, { error: 'ticketId required' })

  const db = supabase()
  const { data: ticket, error } = await db.from('tickets').select('*')
    .eq('ticket_id', String(ticketId).toUpperCase()).eq('payment_status', 'paid').single()

  if (error || !ticket) return send(res, 404, { error: 'Ticket not found' })
  if (ticket.is_scanned) return send(res, 409, { error: 'already_scanned', ticket })

  await db.from('tickets').update({ is_scanned: true, scanned_at: new Date().toISOString() }).eq('ticket_id', ticket.ticket_id)
  return send(res, 200, { ticket: { ...ticket, is_scanned: true } })
}

async function handleGetTickets(req, res) {
  const token = req.headers['x-admin-token']
  if (!verifyToken(token)) return send(res, 401, { error: 'Unauthorized' })

  const { data, error } = await supabase()
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return send(res, 500, { error: 'DB error' })
  return send(res, 200, { tickets: data })
}

async function handleVerifyAdmin(req, res) {
  const { password } = await readBody(req)
  if (!ADMIN_SECRET || !password) return send(res, 400, { ok: false })
  try {
    const valid = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_SECRET))
    if (!valid) return send(res, 401, { ok: false })
  } catch { return send(res, 401, { ok: false }) }
  return send(res, 200, { ok: true, token: generateToken() })
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const [path, query] = (req.url ?? '').split('?')

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-admin-token', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' })
    return res.end()
  }

  console.log(`[api] ${req.method} ${path}`)

  try {
    if (path === '/api/verify-payment' && req.method === 'POST') return await handleVerifyPayment(req, res)
    if (path === '/api/get-ticket'     && req.method === 'GET')  return await handleGetTicket(req, res, query)
    if (path === '/api/get-tickets'    && req.method === 'GET')  return await handleGetTickets(req, res)
    if (path === '/api/scan-ticket'    && req.method === 'POST') return await handleScanTicket(req, res)
    if (path === '/api/verify-admin'   && req.method === 'POST') return await handleVerifyAdmin(req, res)
    send(res, 404, { error: 'Not found' })
  } catch (err) {
    console.error(err)
    send(res, 500, { error: 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`\n✅  Local API server running on http://localhost:${PORT}`)
  console.log(`   /api/verify-payment  POST`)
  console.log(`   /api/get-ticket      GET`)
  console.log(`   /api/scan-ticket     POST`)
  console.log(`   /api/verify-admin    POST\n`)
})
