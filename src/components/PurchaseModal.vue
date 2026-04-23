<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { EVENT } from '../config/event'
import type { TicketType } from '../config/event'

const props = defineProps<{ visible: boolean; initialType: TicketType }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()

watch(() => props.visible, v => { if (v) error.value = '' })

const error = ref('')
const form = ref({ name: '', email: '', phone: '', quantity: 1 })

const ticket = EVENT.ticket
const subtotal = computed(() => ticket.price * form.value.quantity)

function formatPrice(n: number) { return EVENT.currency + n.toLocaleString() }

function generateRef() {
  return `JE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

function validate() {
  if (!form.value.name.trim()) return 'Full name is required'
  if (!form.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) return 'Valid email is required'
  if (!form.value.phone.trim()) return 'Phone number is required'
  return null
}

async function pay() {
  const err = validate()
  if (err) { error.value = err; return }
  error.value = ''

  const PaystackPop = (window as any).PaystackPop
  if (!PaystackPop) {
    error.value = 'Payment system is loading, please try again in a moment.'
    return
  }

  const ref = generateRef()

  const handler = PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: form.value.email,
    amount: subtotal.value * 100,
    currency: EVENT.currencyCode,
    ref,
    metadata: {
      custom_fields: [
        { display_name: 'Full Name',    variable_name: 'buyer_name',   value: form.value.name },
        { display_name: 'Phone Number', variable_name: 'buyer_phone',  value: form.value.phone },
        { display_name: 'Ticket Type',  variable_name: 'ticket_type',  value: ticket.id },
        { display_name: 'Quantity',     variable_name: 'quantity',     value: String(form.value.quantity) },
      ],
    },
    onSuccess: (transaction: { reference: string }) => {
      emit('close')
      router.push({ name: 'processing', query: { ref: transaction.reference } })
    },
    onCancel: () => {},
  })
  handler.openIframe()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/80" @click="emit('close')"></div>

        <div class="relative w-full max-w-lg bg-dark-800 border border-dark-500 rounded-3xl overflow-hidden shadow-2xl">

          <!-- Fire top bar -->
          <div class="h-1.5" style="background:linear-gradient(90deg,#FF4500,#FF7A00,#FFD400,#FF7A00,#FF4500)"></div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 class="font-display font-bold text-xl text-white">Get Your Ticket</h2>
              <p class="text-gray-500 text-sm">{{ EVENT.eventName }} · Fire &amp; Ice Escape</p>
            </div>
            <button @click="emit('close')"
              class="w-8 h-8 rounded-full bg-dark-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors">✕</button>
          </div>

          <!-- Ticket summary -->
          <div class="mx-6 mb-5 p-4 rounded-2xl border"
            style="border-color:rgba(255,122,0,0.25);background:rgba(255,122,0,0.06)">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs tracking-wider uppercase font-bold" style="color:#FF7A00">{{ ticket.label }}</div>
                <div class="text-3xl font-display font-black text-white mt-0.5">{{ formatPrice(ticket.price) }}</div>
                <div class="text-gray-500 text-xs mt-0.5">All-inclusive · per person</div>
              </div>
              <div class="text-right">
                <div class="text-gray-500 text-xs mb-1.5">Quantity</div>
                <select v-model.number="form.quantity"
                  class="bg-dark-600 border border-dark-500 rounded-lg px-3 py-1.5 text-white text-sm outline-none">
                  <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="px-6 space-y-3 mb-5">
            <div>
              <label class="text-gray-400 text-xs tracking-wider uppercase block mb-1.5">Full Name *</label>
              <input v-model="form.name" type="text" placeholder="John Doe"
                class="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors" />
            </div>
            <div>
              <label class="text-gray-400 text-xs tracking-wider uppercase block mb-1.5">Email Address *</label>
              <input v-model="form.email" type="email" placeholder="john@example.com"
                class="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors" />
            </div>
            <div>
              <label class="text-gray-400 text-xs tracking-wider uppercase block mb-1.5">WhatsApp / Phone *</label>
              <input v-model="form.phone" type="tel" placeholder="+234 800 000 0000"
                class="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors" />
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="mx-6 mb-4 p-3 bg-red-900/30 border border-red-700/40 rounded-xl text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Order total + pay -->
          <div class="px-6 pb-6">
            <div class="flex items-center justify-between text-sm mb-4 px-1">
              <span class="text-gray-500">{{ form.quantity }}× {{ ticket.label }}</span>
              <span class="font-black text-white text-xl">{{ formatPrice(subtotal) }}</span>
            </div>
            <button @click="pay" class="btn-fire w-full py-4 font-black text-base rounded-2xl">
              🔥 Pay {{ formatPrice(subtotal) }} with Paystack
            </button>
            <p class="text-center text-gray-600 text-xs mt-3">
              🔒 Secured by Paystack · Instant QR ticket delivery
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.95) translateY(10px); }
</style>
