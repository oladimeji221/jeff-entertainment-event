<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { EVENT } from '../config/event'

const route = useRoute()
const router = useRouter()

interface Ticket {
  ticket_id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  ticket_type: 'regular' | 'vip' | 'vvip'
  quantity: number
  unit_price: number
  total_amount: number
  created_at: string
}

const ticket = ref<Ticket | null>(null)
const loading = ref(true)
const error = ref('')
const qrDataUrl = ref('')
const downloading = ref(false)

const ticketId = computed(() => route.params.id as string)

const typeConfig = {
  regular: { label: 'General Admission', color: '#FF7A00', border: '#FF7A0060' },
  vip:     { label: 'General Admission', color: '#FF7A00', border: '#FF7A0060' },
  vvip:    { label: 'General Admission', color: '#FF7A00', border: '#FF7A0060' },
}

function formatPrice(n: number) { return EVENT.currency + n.toLocaleString() }
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  try {
    const res = await fetch(`/api/get-ticket?id=${ticketId.value}`)
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Ticket not found')
    ticket.value = data.ticket
    // Generate QR code
    qrDataUrl.value = await QRCode.toDataURL(ticket.value!.ticket_id, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
  } catch (e: any) {
    error.value = e.message || 'Could not load ticket'
  } finally {
    loading.value = false
  }
})

function printTicket() { window.print() }

async function downloadTicket() {
  if (!ticket.value) return
  downloading.value = true
  try {
    const el = document.getElementById('ticket-card')!
    const canvas = await html2canvas(el, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
    })
    const link = document.createElement('a')
    link.download = `JeffEntertainment-${ticket.value.ticket_id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex flex-col items-center justify-start py-12 px-4">

    <!-- Header -->
    <div class="w-full max-w-xl mb-8 flex items-center justify-between">
      <button @click="router.push('/')" class="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors text-sm">
        ← Back to home
      </button>
      <div class="flex items-center gap-3">
        <img src="/logo.jpg" alt="Jeff Entertainment" class="h-8 w-auto object-contain" />
        <span class="font-display text-sm font-bold gradient-text">Jeff Entertainment</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center gap-4 py-20">
      <div class="w-12 h-12 border-4 border-dark-500 border-t-gold rounded-full animate-spin"></div>
      <p class="text-gray-500">Loading your ticket…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="w-full max-w-xl text-center py-20">
      <div class="text-5xl mb-4">😕</div>
      <h2 class="text-white font-bold text-xl mb-2">Ticket Not Found</h2>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <p class="text-gray-600 text-sm">If you just made a payment, please wait a moment and refresh the page. If the issue persists, contact support.</p>
    </div>

    <!-- Ticket -->
    <template v-else-if="ticket">
      <!-- Success banner -->
      <div class="w-full max-w-xl mb-6 p-4 bg-green-900/30 border border-green-700/40 rounded-2xl flex items-center gap-3">
        <span class="text-2xl">🎉</span>
        <div>
          <div class="text-green-400 font-semibold text-sm">Payment Confirmed!</div>
          <div class="text-gray-400 text-xs">Your ticket is ready. Download or screenshot it for entry.</div>
        </div>
      </div>

      <!-- THE TICKET CARD (this is what gets downloaded) -->
      <div id="ticket-card" class="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
        style="border:2px solid rgba(255,122,0,0.5);box-shadow:0 0 40px rgba(255,107,0,0.15)">

        <!-- Fire stripe -->
        <div style="height:5px;background:linear-gradient(90deg,#FF4500,#FF7A00,#FFD400,#FF7A00,#FF4500)"></div>

        <!-- Top section with forest bg + gradient overlay -->
        <div class="relative p-6 sm:p-8"
          :style="{
            background: `linear-gradient(160deg, rgba(10,5,0,0.82) 0%, rgba(5,10,5,0.75) 100%), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80') center/cover no-repeat`,
          }">
          <!-- Header row -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <img src="/logo.jpg" alt="Jeff Entertainment" class="h-8 w-auto object-contain" />
                <span class="font-display font-bold text-white text-sm">{{ EVENT.organizerName }}</span>
              </div>
              <div
                class="text-xs font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full border inline-block"
                :style="{ color: typeConfig[ticket.ticket_type].color, borderColor: typeConfig[ticket.ticket_type].color + '50', backgroundColor: typeConfig[ticket.ticket_type].color + '15' }"
              >
                {{ typeConfig[ticket.ticket_type].label }} Ticket
              </div>
            </div>
            <div class="text-right">
              <div class="text-gray-500 text-xs">Total Paid</div>
              <div class="font-display font-black text-2xl text-white">{{ formatPrice(ticket.total_amount) }}</div>
              <div class="text-gray-500 text-xs">{{ ticket.quantity }} × {{ typeConfig[ticket.ticket_type].label }}</div>
            </div>
          </div>

          <!-- Event name -->
          <div class="mb-6">
            <h1 class="font-display font-black text-3xl sm:text-4xl text-white leading-tight">{{ EVENT.eventName }}</h1>
            <p class="text-gray-400 text-sm mt-1">{{ EVENT.tagline }}</p>
          </div>

          <!-- Event details row -->
          <div class="grid grid-cols-3 gap-3 mb-6 text-sm">
            <div>
              <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Date</div>
              <div class="text-white font-medium">{{ EVENT.displayDate }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Time</div>
              <div class="text-white font-medium">{{ EVENT.time }}</div>
            </div>
            <div>
              <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Venue</div>
              <div class="text-white font-medium text-xs">{{ EVENT.venue }}</div>
            </div>
          </div>
        </div>

        <!-- Perforation line -->
        <div class="bg-dark-950 flex items-center gap-1 px-2" style="height: 24px">
          <div class="w-3 h-3 rounded-full bg-dark-950 -ml-5 flex-shrink-0 border-r border-dark-500"></div>
          <div class="flex-1 border-t-2 border-dashed border-dark-500 mx-2"></div>
          <div class="w-3 h-3 rounded-full bg-dark-950 -mr-5 flex-shrink-0 border-l border-dark-500"></div>
        </div>

        <!-- Bottom section: holder info + QR -->
        <div class="bg-dark-800 p-6 sm:p-8">
          <div class="flex items-start justify-between gap-6">
            <!-- Holder info -->
            <div class="flex-1">
              <div class="mb-4">
                <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Ticket Holder</div>
                <div class="text-white font-bold text-lg">{{ ticket.buyer_name }}</div>
                <div class="text-gray-500 text-sm">{{ ticket.buyer_email }}</div>
              </div>
              <div class="mb-4">
                <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Ticket ID</div>
                <div class="font-mono text-gold font-bold tracking-widest text-sm">{{ ticket.ticket_id }}</div>
              </div>
              <div>
                <div class="text-gray-500 text-xs tracking-wider uppercase mb-1">Issued</div>
                <div class="text-gray-300 text-sm">{{ formatDate(ticket.created_at) }}</div>
              </div>
            </div>

            <!-- QR Code -->
            <div class="flex-shrink-0 flex flex-col items-center gap-2">
              <div class="bg-white p-3 rounded-xl">
                <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-28 h-28 sm:w-32 sm:h-32" />
                <div v-else class="w-28 h-28 sm:w-32 sm:h-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <span class="text-gray-600 text-xs">Scan at entry</span>
            </div>
          </div>

          <!-- Barcode strip at bottom -->
          <div class="mt-6 pt-5 border-t border-dark-500 flex items-center justify-between">
            <div class="flex gap-0.5 items-end h-8">
              <div v-for="i in 30" :key="i"
                class="w-0.5 bg-dark-400"
                :style="{ height: (Math.sin(i * 0.8) * 0.5 + 0.5) * 100 + '%' }"></div>
            </div>
            <span class="text-gray-600 text-xs font-mono">{{ ticket.ticket_id }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="w-full max-w-xl mt-6 flex flex-col sm:flex-row gap-3">
        <button @click="downloadTicket" :disabled="downloading"
          class="btn-gold flex-1 py-3.5 text-sm font-bold disabled:opacity-70">
          {{ downloading ? 'Generating…' : '⬇️ Download Ticket (PNG)' }}
        </button>
        <button @click="printTicket()"
          class="btn-outline-gold flex-1 py-3.5 text-sm font-bold">
          🖨️ Print Ticket
        </button>
      </div>

      <p class="text-gray-600 text-xs mt-4 text-center max-w-sm">
        Keep this ticket safe. Present the QR code at the entry gate. Each QR code can only be scanned once.
      </p>
    </template>
  </div>
</template>

<style>
@media print {
  body * { visibility: hidden; }
  #ticket-card, #ticket-card * { visibility: visible; }
  #ticket-card { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
