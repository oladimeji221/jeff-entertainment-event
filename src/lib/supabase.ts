import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Ticket {
  id: string
  ticket_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  ticket_type: 'regular' | 'vip' | 'vvip'
  quantity: number
  unit_price: number
  total_amount: number
  paystack_reference: string
  payment_status: 'pending' | 'paid'
  is_scanned: boolean
  scanned_at: string | null
  created_at: string
}
