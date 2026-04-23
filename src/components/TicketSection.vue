<script setup lang="ts">
import { EVENT } from '../config/event'
import type { TicketType } from '../config/event'

const emit = defineEmits<{ (e: 'openModal', type: TicketType): void }>()

function formatPrice(n: number) { return EVENT.currency + n.toLocaleString() }
</script>

<template>
  <section id="tickets" class="py-24 px-4 bg-dark-950 relative overflow-hidden">

    <!-- Ambient glows -->
    <div class="absolute inset-0 pointer-events-none">
      <div style="position:absolute;top:0;left:0;right:0;height:600px;background:radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,107,0,0.10) 0%, transparent 65%)"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:400px;background:radial-gradient(ellipse 60% 50% at 50% 120%, rgba(0,212,245,0.07) 0%, transparent 60%)"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto">

      <!-- Section header -->
      <div class="text-center mb-16 reveal">
        <p class="text-fire text-xs tracking-[0.45em] uppercase font-bold mb-4" style="color:#FF9A00">
          ⚠️ Limited Slots Available
        </p>
        <h2 class="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
          Secure Your <span style="background:linear-gradient(135deg,#FF6B00,#FF9A00,#FFD400);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Spot</span>
        </h2>
        <p class="text-gray-500 max-w-xl mx-auto text-base">
          One ticket. Everything included. Come alone, leave as family.
        </p>
      </div>

      <!-- Main two-column layout -->
      <div class="grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-start">

        <!-- ── LEFT: What to expect ──────────────────── -->
        <div class="reveal">

          <!-- What's included bar -->
          <div class="mb-10 p-5 rounded-2xl border border-fire/20 bg-fire/5">
            <p class="text-fire-mid text-xs tracking-[0.35em] uppercase font-bold mb-4" style="color:#FF9A00">Everything Included at ₦40,000</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div v-for="h in EVENT.highlights" :key="h.label"
                class="flex items-start gap-3 bg-dark-800/60 rounded-xl p-3 border border-dark-600">
                <span class="text-xl flex-shrink-0">{{ h.icon }}</span>
                <div>
                  <div class="text-white text-xs font-bold">{{ h.label }}</div>
                  <div class="text-gray-500 text-xs leading-snug mt-0.5">{{ h.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day programme -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-5">
              <div class="h-px flex-1" style="background:linear-gradient(90deg,rgba(255,154,0,0.5),transparent)"></div>
              <span class="text-xs font-black tracking-[0.35em] uppercase px-4 py-1.5 rounded-full border"
                style="color:#FF9A00;border-color:rgba(255,154,0,0.3);background:rgba(255,154,0,0.08)">
                ☀️ Day Programme
              </span>
              <div class="h-px flex-1" style="background:linear-gradient(90deg,transparent,rgba(255,154,0,0.5))"></div>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="v in EVENT.dayVibes" :key="v.text"
                class="flex items-center gap-3 bg-dark-800/40 rounded-xl px-4 py-3 border border-dark-700/60">
                <span class="text-2xl">{{ v.icon }}</span>
                <span class="text-gray-300 text-sm">{{ v.text }}</span>
              </div>
            </div>
          </div>

          <!-- Night programme -->
          <div>
            <div class="flex items-center gap-3 mb-5">
              <div class="h-px flex-1" style="background:linear-gradient(90deg,rgba(0,212,245,0.4),transparent)"></div>
              <span class="text-xs font-black tracking-[0.35em] uppercase px-4 py-1.5 rounded-full border"
                style="color:#00D4F5;border-color:rgba(0,212,245,0.3);background:rgba(0,212,245,0.06)">
                🌙 Night Vibes
              </span>
              <div class="h-px flex-1" style="background:linear-gradient(90deg,transparent,rgba(0,212,245,0.4))"></div>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="v in EVENT.nightVibes" :key="v.text"
                class="flex items-center gap-3 bg-dark-800/40 rounded-xl px-4 py-3 border border-dark-700/60">
                <span class="text-2xl">{{ v.icon }}</span>
                <span class="text-gray-300 text-sm">{{ v.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: Single ticket card ──────────────── -->
        <div class="reveal lg:sticky lg:top-24">
          <div class="relative rounded-3xl overflow-hidden"
            style="border:2px solid rgba(255,122,0,0.5);box-shadow:0 0 60px rgba(255,107,0,0.18),0 0 120px rgba(255,107,0,0.07)">

            <!-- Fire gradient top bar -->
            <div class="h-1.5" style="background:linear-gradient(90deg,#FF4500,#FF7A00,#FFD400,#FF7A00,#FF4500)"></div>

            <!-- Most Popular badge -->
            <div class="text-center py-3 text-xs font-black tracking-widest uppercase text-black"
              style="background:linear-gradient(135deg,#FF6B00,#FF9A00,#FFD400)">
              🔥 The One Ticket You Need
            </div>

            <!-- Card body -->
            <div style="background:linear-gradient(160deg,#1A1008 0%,#0D0803 100%)" class="p-7">

              <!-- Label -->
              <div class="mb-4">
                <span class="text-xs font-bold tracking-[0.35em] uppercase px-3 py-1 rounded-full border"
                  style="color:#FF7A00;border-color:rgba(255,122,0,0.4);background:rgba(255,122,0,0.12)">
                  {{ EVENT.ticket.label }}
                </span>
              </div>

              <!-- Price -->
              <div class="mb-2">
                <span class="font-display font-black text-5xl sm:text-6xl text-white">{{ formatPrice(EVENT.ticket.price) }}</span>
              </div>
              <p class="text-gray-500 text-sm mb-6">per person · all-inclusive</p>

              <p class="text-gray-400 text-sm leading-relaxed mb-6">{{ EVENT.ticket.description }}</p>

              <!-- Divider -->
              <div class="h-px mb-6" style="background:linear-gradient(90deg,transparent,rgba(255,122,0,0.5),transparent)"></div>

              <!-- Benefits list -->
              <ul class="space-y-3 mb-8">
                <li v-for="b in EVENT.ticket.benefits" :key="b" class="flex items-start gap-3 text-sm text-gray-300">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" style="color:#FF7A00" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  {{ b }}
                </li>
              </ul>

              <!-- CTA button -->
              <button @click="emit('openModal', EVENT.ticket.id)"
                class="btn-fire w-full py-4 text-base font-black tracking-wide rounded-2xl">
                🔥 Book Now — {{ formatPrice(EVENT.ticket.price) }}
              </button>

              <p class="text-center text-gray-600 text-xs mt-4">
                🔒 Secure payment · Instant QR ticket · Limited slots
              </p>
            </div>
          </div>

          <!-- Urgency note below card -->
          <div class="mt-4 text-center">
            <p class="text-xs text-gray-600">
              Spots fill up fast. Once they're gone, they're gone.
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
