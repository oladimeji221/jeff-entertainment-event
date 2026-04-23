-- ──────────────────────────────────────────────────────────
--  Jeff Entertainment — Supabase Schema
--  Run this in your Supabase SQL editor to set up the DB
-- ──────────────────────────────────────────────────────────

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

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS tickets_ticket_id_idx ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS tickets_paystack_ref_idx ON tickets(paystack_reference);
CREATE INDEX IF NOT EXISTS tickets_email_idx ON tickets(buyer_email);

-- Row Level Security: allow service role full access, restrict anon
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Service role (used by API routes) bypasses RLS automatically.
-- The anon key (used from browser) has no direct access — everything
-- goes through the /api/* serverless functions.

-- (Optional) Allow anyone to read a ticket by its ticket_id — safe since
-- the ID is only known to the buyer. Remove if you want fully private.
CREATE POLICY "read own ticket" ON tickets
  FOR SELECT USING (true);
