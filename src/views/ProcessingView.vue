<script setup lang="ts">
/**
 * Called immediately after Paystack onSuccess.
 * Retries the verify-payment API until it succeeds or times out.
 * The user always sees their payment reference so they can never lose a ticket.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EVENT } from '../config/event'

const route  = useRoute()
const router = useRouter()

const reference = route.query.ref as string
const status    = ref<'processing' | 'success' | 'failed'>('processing')
const attempt   = ref(0)
const maxTries  = 10
const ticketId  = ref('')

async function tryVerify() {
  attempt.value++
  try {
    const res  = await fetch('/api/verify-payment', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reference }),
    })
    const data = await res.json()
    if (data.ticketId) {
      ticketId.value = data.ticketId
      status.value   = 'success'
      setTimeout(() => router.push(`/ticket/${data.ticketId}`), 1500)
      return
    }
  } catch { /* network error — will retry */ }

  if (attempt.value < maxTries) {
    setTimeout(tryVerify, 3000)
  } else {
    status.value = 'failed'
  }
}

function copyRef() {
  navigator.clipboard.writeText(reference).then(() => alert('Copied!'))
}

onMounted(() => {
  if (!reference) { router.push('/'); return }
  tryVerify()
})
</script>

<template>
  <div class="min-h-screen bg-dark-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md text-center">

      <!-- Processing -->
      <div v-if="status === 'processing'">
        <div class="relative w-24 h-24 mx-auto mb-8">
          <div class="w-24 h-24 border-4 border-dark-600 border-t-gold rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-gold flex items-center justify-center font-display font-bold text-black">JE</div>
          </div>
        </div>
        <h1 class="font-display font-bold text-2xl text-white mb-3">Confirming your payment…</h1>
        <p class="text-gray-500 mb-6">Please wait, do not close this page.</p>
        <div class="bg-dark-800 border border-dark-500 rounded-2xl p-4">
          <div class="text-gray-600 text-xs tracking-wider uppercase mb-1">Payment Reference</div>
          <div class="font-mono text-gold text-sm break-all">{{ reference }}</div>
          <div class="text-gray-600 text-xs mt-2">Attempt {{ attempt }} of {{ maxTries }}</div>
        </div>
      </div>

      <!-- Success (briefly shown before redirect) -->
      <div v-else-if="status === 'success'">
        <div class="text-7xl mb-6">🎉</div>
        <h1 class="font-display font-bold text-3xl text-white mb-3">Payment Confirmed!</h1>
        <p class="text-gray-400 mb-4">Generating your ticket…</p>
        <div class="font-mono text-gold text-sm">{{ ticketId }}</div>
      </div>

      <!-- Failed — payment IS saved, just show ref clearly -->
      <div v-else>
        <div class="text-7xl mb-6">⚠️</div>
        <h1 class="font-display font-bold text-2xl text-white mb-3">Payment received!</h1>
        <p class="text-gray-400 mb-2 text-sm leading-relaxed">
          Your payment went through successfully, but we couldn't reach our server to generate your ticket right now.
        </p>
        <p class="text-gray-500 text-sm mb-6">
          <strong class="text-white">Your money is safe.</strong> Use the reference below to claim your ticket at any time.
        </p>

        <!-- Reference (most important thing on the page) -->
        <div class="bg-dark-800 border-2 border-gold/40 rounded-2xl p-5 mb-6 glow-gold">
          <div class="text-gold text-xs tracking-widest uppercase mb-2">Save this reference</div>
          <div class="font-mono text-white text-lg font-bold break-all">{{ reference }}</div>
          <button
            @click="copyRef()"
            class="mt-3 text-xs text-gray-500 hover:text-gold transition-colors underline"
          >
            Copy to clipboard
          </button>
        </div>

        <div class="flex flex-col gap-3">
          <button
            @click="status = 'processing'; attempt = 0; tryVerify()"
            class="btn-gold w-full py-3.5 font-bold"
          >
            🔄 Try Again
          </button>
          <a
            :href="`mailto:${EVENT.contact.email}?subject=Ticket Recovery&body=Payment reference: ${reference}`"
            class="btn-outline-gold w-full py-3.5 font-bold text-sm"
          >
            📧 Email Support with Reference
          </a>
        </div>
      </div>

    </div>
  </div>
</template>
