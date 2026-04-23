<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import jsQR from 'jsqr'

// ── Auth ──────────────────────────────────────────────────
const password = ref('')
const authed = ref(false)
const authError = ref('')
const authLoading = ref(false)

async function login() {
  authLoading.value = true
  authError.value = ''
  try {
    const res = await fetch('/api/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    })
    const data = await res.json()
    if (data.ok) {
      sessionStorage.setItem('admin_token', data.token)
      authed.value = true
      startCamera()
    } else {
      authError.value = 'Incorrect password.'
    }
  } catch {
    authError.value = 'Network error. Please try again.'
  } finally {
    authLoading.value = false
  }
}

// ── Scanner ──────────────────────────────────────────────
interface ScannedTicket {
  ticket_id: string
  buyer_name: string
  buyer_email: string
  ticket_type: 'regular' | 'vip' | 'vvip'
  quantity: number
  total_amount: number
  is_scanned: boolean
}

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanning = ref(false)
const scanStatus = ref<'idle' | 'success' | 'used' | 'invalid' | 'error'>('idle')
const lastTicket = ref<ScannedTicket | null>(null)
const lastError = ref('')
const log = ref<Array<{ ticket: ScannedTicket; time: string; status: 'ok' | 'used' }>>([])
let stream: MediaStream | null = null
let rafId: number

const typeConfig = {
  regular: { label: 'Regular', color: '#9CA3AF' },
  vip:     { label: 'VIP',     color: '#F59E0B' },
  vvip:    { label: 'VVIP',    color: '#8B5CF6' },
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play()
      scanning.value = true
      requestAnimationFrame(tick)
    }
  } catch {
    lastError.value = 'Camera access denied. Please allow camera permission and refresh.'
    scanStatus.value = 'error'
  }
}

function stopCamera() {
  stream?.getTracks().forEach(t => t.stop())
  cancelAnimationFrame(rafId)
  scanning.value = false
}

let lastScannedCode = ''
let cooldown = false

function tick() {
  rafId = requestAnimationFrame(tick)
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas || video.readyState !== 4) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })

  if (code && code.data && code.data !== lastScannedCode && !cooldown) {
    lastScannedCode = code.data
    cooldown = true
    handleScan(code.data)
    setTimeout(() => { cooldown = false; lastScannedCode = '' }, 3000)
  }
}

async function handleScan(ticketId: string) {
  const token = sessionStorage.getItem('admin_token') || ''
  try {
    const res = await fetch('/api/scan-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ticketId }),
    })
    const data = await res.json()

    if (data.error === 'already_scanned') {
      lastTicket.value = data.ticket
      scanStatus.value = 'used'
      addToLog(data.ticket, 'used')
    } else if (data.error) {
      lastError.value = data.error
      scanStatus.value = 'invalid'
    } else {
      lastTicket.value = data.ticket
      scanStatus.value = 'success'
      addToLog(data.ticket, 'ok')
    }
  } catch {
    lastError.value = 'Network error during scan.'
    scanStatus.value = 'error'
  }
}

function addToLog(ticket: ScannedTicket, status: 'ok' | 'used') {
  log.value.unshift({
    ticket,
    status,
    time: new Date().toLocaleTimeString(),
  })
  if (log.value.length > 50) log.value.pop()
}

function resetScan() {
  scanStatus.value = 'idle'
  lastTicket.value = null
  lastError.value = ''
  lastScannedCode = ''
  cooldown = false
}

function formatPrice(n: number) { return '₦' + n.toLocaleString() }

onUnmounted(() => stopCamera())
</script>

<template>
  <div class="min-h-screen bg-dark-950 text-white">

    <!-- ── Login Screen ──────────────────────────────── -->
    <div v-if="!authed" class="min-h-screen flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-10">
          <img src="/jeff.jpg" alt="Jeff Entertainment" class="h-16 w-auto object-contain mx-auto mb-4 shadow-lg" />
          <h1 class="font-display font-bold text-2xl text-white mb-1">Admin Access</h1>
          <p class="text-gray-500 text-sm">Jeff Entertainment — Ticket Scanner</p>
        </div>

        <div class="card-dark p-8">
          <div class="mb-5">
            <label class="text-gray-400 text-xs tracking-wider uppercase block mb-2">Admin Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Enter admin password"
              @keyup.enter="login"
              class="w-full bg-dark-600 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-gold/60 transition-colors"
            />
          </div>
          <div v-if="authError" class="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-xl p-3">
            {{ authError }}
          </div>
          <button @click="login" :disabled="authLoading" class="btn-gold w-full py-3.5 font-bold">
            {{ authLoading ? 'Verifying…' : 'Enter Scanner' }}
          </button>
        </div>

        <p class="text-center text-gray-700 text-xs mt-6">
          Authorised personnel only · Jeff Entertainment
        </p>
      </div>
    </div>

    <!-- ── Scanner Screen ────────────────────────────── -->
    <div v-else class="max-w-2xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <img src="/jeff.jpg" alt="Jeff Entertainment" class="h-9 w-auto object-contain" />
          <div>
            <div class="font-bold text-white text-sm">Ticket Scanner</div>
            <div class="text-gray-600 text-xs">Jeff Entertainment</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div :class="['w-2.5 h-2.5 rounded-full', scanning ? 'bg-green-400 animate-pulse' : 'bg-gray-600']"></div>
          <span class="text-xs text-gray-500">{{ scanning ? 'Camera active' : 'Camera off' }}</span>
        </div>
      </div>

      <!-- Camera view -->
      <div class="relative rounded-2xl overflow-hidden bg-dark-800 border border-dark-500 mb-6" style="aspect-ratio: 4/3">
        <video ref="videoRef" class="w-full h-full object-cover" playsinline muted></video>
        <canvas ref="canvasRef" class="hidden"></canvas>

        <!-- Scanning overlay -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <!-- Corner brackets -->
          <div class="relative w-52 h-52">
            <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold rounded-tl-lg"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-lg"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-lg"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold rounded-br-lg"></div>
            <!-- Scan line -->
            <div class="absolute left-2 right-2 h-0.5 bg-gold/70 scan-line" style="box-shadow: 0 0 8px #F59E0B"></div>
          </div>
        </div>

        <!-- Status overlay -->
        <Transition name="fade">
          <div v-if="scanStatus !== 'idle'"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4"
            :class="{
              'bg-green-900/90': scanStatus === 'success',
              'bg-red-900/90': scanStatus === 'used' || scanStatus === 'invalid' || scanStatus === 'error',
            }"
          >
            <div class="text-6xl">
              {{ scanStatus === 'success' ? '✅' : scanStatus === 'used' ? '⚠️' : '❌' }}
            </div>
            <div class="text-white font-bold text-xl text-center px-4">
              {{ scanStatus === 'success' ? 'Valid Ticket!' : scanStatus === 'used' ? 'Already Scanned!' : 'Invalid Ticket' }}
            </div>
            <div v-if="lastTicket" class="text-center">
              <div class="text-white font-bold">{{ lastTicket.buyer_name }}</div>
              <div class="text-gray-300 text-sm">{{ typeConfig[lastTicket.ticket_type].label }} × {{ lastTicket.quantity }}</div>
            </div>
            <button @click="resetScan" class="mt-2 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors">
              Scan Next →
            </button>
          </div>
        </Transition>
      </div>

      <!-- Last scan result card -->
      <div v-if="lastTicket && (scanStatus === 'success' || scanStatus === 'used')"
        class="card-dark p-5 mb-6 border"
        :class="scanStatus === 'success' ? 'border-green-700/50' : 'border-red-700/50'"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-xs tracking-wider uppercase mb-1"
              :class="scanStatus === 'success' ? 'text-green-400' : 'text-red-400'">
              {{ scanStatus === 'success' ? '✅ Admitted' : '⚠️ Duplicate — Denied Entry' }}
            </div>
            <div class="font-bold text-white text-lg">{{ lastTicket.buyer_name }}</div>
            <div class="text-gray-500 text-sm">{{ lastTicket.buyer_email }}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                :style="{ color: typeConfig[lastTicket.ticket_type].color, backgroundColor: typeConfig[lastTicket.ticket_type].color + '20' }">
                {{ typeConfig[lastTicket.ticket_type].label }}
              </span>
              <span class="text-gray-500 text-xs">× {{ lastTicket.quantity }}</span>
              <span class="text-gray-500 text-xs">· {{ formatPrice(lastTicket.total_amount) }}</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="font-mono text-gold text-xs">{{ lastTicket.ticket_id }}</div>
          </div>
        </div>
      </div>

      <!-- Session log -->
      <div v-if="log.length > 0" class="card-dark overflow-hidden">
        <div class="px-5 py-3 border-b border-dark-500 flex items-center justify-between">
          <span class="text-sm font-medium text-white">Session Log</span>
          <span class="text-xs text-gray-500">{{ log.filter(l=>l.status==='ok').length }} admitted</span>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div v-for="(entry, i) in log" :key="i"
            class="flex items-center justify-between px-5 py-3 border-b border-dark-600 last:border-0 text-sm">
            <div class="flex items-center gap-3">
              <span>{{ entry.status === 'ok' ? '✅' : '⚠️' }}</span>
              <div>
                <div class="text-white font-medium">{{ entry.ticket.buyer_name }}</div>
                <div class="text-gray-600 text-xs">{{ typeConfig[entry.ticket.ticket_type].label }} · {{ entry.ticket.ticket_id }}</div>
              </div>
            </div>
            <span class="text-gray-600 text-xs">{{ entry.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
