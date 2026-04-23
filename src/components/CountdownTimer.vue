<script setup lang="ts">
import { EVENT } from '../config/event'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section class="py-20 px-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-dark-900"></div>
    <div class="absolute inset-0"
      style="background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,107,0,0.07) 0%, transparent 70%)"></div>

    <div class="relative z-10 max-w-3xl mx-auto text-center reveal">
      <div class="text-5xl mb-5">📅</div>
      <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-3">Save the Date</p>
      <h2 class="section-title text-4xl sm:text-5xl mb-4">Date Coming Soon</h2>
      <p class="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        The date for <strong class="text-white">{{ EVENT.eventName }}</strong> — Fire &amp; Ice Escape
        is being announced shortly. Follow us on social media to be the first to know.
      </p>

      <!-- Teaser cards -->
      <div class="grid grid-cols-3 gap-4 mb-10">
        <div class="card-dark p-5 glow-fire">
          <div class="font-display font-black text-3xl text-white">TBA</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-1">Date</div>
        </div>
        <div class="card-dark p-5">
          <div class="font-display font-black text-3xl" style="color:#FF9A00">Akure</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-1">Take-Off</div>
        </div>
        <div class="card-dark p-5 glow-ice">
          <div class="font-display font-black text-3xl" style="color:#00D4F5">40K</div>
          <div class="text-gray-500 text-xs uppercase tracking-widest mt-1">Per Person</div>
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
