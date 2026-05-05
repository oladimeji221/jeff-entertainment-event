<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EVENT } from '../config/event'

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

let interval: number | null = null

function updateCountdown() {
  const eventDate = new Date(EVENT.date).getTime()
  const now = new Date().getTime()
  const distance = eventDate - now

  if (distance > 0) {
    days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000)
  }
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  updateCountdown()
  interval = window.setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <section class="py-20 px-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-dark-900"></div>
    <div class="absolute inset-0"
      style="background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,107,0,0.07) 0%, transparent 70%)"></div>

    <div class="relative z-10 max-w-3xl mx-auto text-center reveal">
      <div class="text-5xl mb-5">⏰</div>
      <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-3">Countdown to Adventure</p>
      <h2 class="section-title text-4xl sm:text-5xl mb-4">{{ EVENT.displayDate }}</h2>
      <p class="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        Don't miss the ultimate <strong class="text-white">{{ EVENT.eventName }}</strong> — Fire &amp; Ice Escape experience!
        Book your spot now before slots run out.
      </p>

      <!-- Countdown timer -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div class="card-dark p-5 glow-fire">
          <div class="font-display font-black text-4xl sm:text-5xl text-white">{{ days }}</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-2">Days</div>
        </div>
        <div class="card-dark p-5 glow-fire">
          <div class="font-display font-black text-4xl sm:text-5xl" style="color:#FF9A00">{{ hours }}</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-2">Hours</div>
        </div>
        <div class="card-dark p-5 glow-ice">
          <div class="font-display font-black text-4xl sm:text-5xl" style="color:#00D4F5">{{ minutes }}</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-2">Minutes</div>
        </div>
        <div class="card-dark p-5 glow-ice">
          <div class="font-display font-black text-4xl sm:text-5xl" style="color:#4DD9F5">{{ seconds }}</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-2">Seconds</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button @click="scrollTo('tickets')" class="btn-fire px-8 py-3 font-bold">
          🔥 Secure Your Spot Now
        </button>
        <a :href="EVENT.social.whatsapp" target="_blank" class="btn-ice px-8 py-3 font-bold">
          📲 Get Notified on WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>
