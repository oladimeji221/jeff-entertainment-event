<script setup lang="ts">
import { EVENT } from '../config/event'
</script>

<template>
  <section id="about" class="py-24 px-4 bg-dark-950">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-16 reveal">
        <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-4">About The Trip</p>
        <h2 class="section-title text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight">
          Where Hot Meets Cold
        </h2>
        <div class="divider-fire w-24 mx-auto mb-6"></div>
        <p class="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">{{ EVENT.description }}</p>
      </div>

      <!-- Highlight cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 reveal">
        <div v-for="h in EVENT.highlights" :key="h.label"
          class="card-dark p-6 text-center hover:border-fire/30 transition-colors group">
          <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">{{ h.icon }}</div>
          <div class="font-bold text-white text-sm mb-1">{{ h.label }}</div>
          <div class="text-gray-500 text-xs">{{ h.desc }}</div>
        </div>
      </div>

      <!-- Day & Night vibes side by side -->
      <div id="vibes" class="grid md:grid-cols-2 gap-6 reveal">

        <!-- Day Vibes -->
        <div class="rounded-3xl overflow-hidden border border-dark-500 relative"
          style="background: linear-gradient(135deg, #1A1008 0%, #0F0804 100%)">
          <div class="absolute inset-0 opacity-10"
            style="background: radial-gradient(ellipse at 50% 120%, rgba(255,212,0,0.6) 0%, transparent 60%)"></div>
          <div class="relative p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-3xl">☀️</span>
              <div>
                <div class="text-xs tracking-[0.3em] uppercase font-medium text-fire-mid">Day Vibes</div>
                <div class="font-display font-bold text-2xl text-white">What to Expect</div>
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="v in EVENT.dayVibes" :key="v.text"
                class="flex items-center gap-4 text-gray-300">
                <span class="text-2xl flex-shrink-0 w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-lg">
                  {{ v.icon }}
                </span>
                <span>{{ v.text }}</span>
              </li>
            </ul>
            <div class="mt-6 pt-5 border-t border-dark-500">
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in ['Nature Walk','Springs Dip','Photography','Games','Bonding']" :key="tag"
                  class="text-xs px-3 py-1 rounded-full border border-fire/30 text-fire-mid bg-fire/5">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Night Vibes -->
        <div class="rounded-3xl overflow-hidden border border-dark-500 relative"
          style="background: linear-gradient(135deg, #080512 0%, #050308 100%)">
          <div class="absolute inset-0 opacity-15"
            style="background: radial-gradient(ellipse at 50% 120%, rgba(139,92,246,0.5) 0%, transparent 60%)"></div>
          <div class="relative p-8">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-3xl">🌙</span>
              <div>
                <div class="text-xs tracking-[0.3em] uppercase font-medium text-ice">Night Vibes</div>
                <div class="font-display font-bold text-2xl text-white">After Dark</div>
              </div>
            </div>
            <ul class="space-y-4">
              <li v-for="v in EVENT.nightVibes" :key="v.text"
                class="flex items-center gap-4 text-gray-300">
                <span class="text-2xl flex-shrink-0 w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-lg">
                  {{ v.icon }}
                </span>
                <span>{{ v.text }}</span>
              </li>
            </ul>
            <div class="mt-6 pt-5 border-t border-dark-500">
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in ['Campfire','BBQ','Dancing','Music','Good Vibes']" :key="tag"
                  class="text-xs px-3 py-1 rounded-full border border-ice/30 text-ice bg-ice/5">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom tagline -->
      <div class="text-center mt-14 reveal">
        <div class="inline-flex items-center gap-4 flex-wrap justify-center text-xl font-display font-bold">
          <span style="color:#4CAF50">🌿 Nature</span>
          <span class="text-white/30">+</span>
          <span style="color:#FF9A00">✨ Lifestyle</span>
          <span class="text-white/30">+</span>
          <span style="color:#00D4F5">🎶 Nightlife</span>
        </div>
        <p class="text-gray-500 mt-2 italic font-display">— all in one trip.</p>
      </div>
    </div>
  </section>
</template>
