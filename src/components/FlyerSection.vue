<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EVENT } from '../config/event'

const showLightbox = ref(false)
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

function openLightbox() {
  showLightbox.value = true
}

function closeLightbox() {
  showLightbox.value = false
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
  <section id="flyer" class="py-24 px-4 bg-dark-900">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-12 reveal">
        <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-4">Event Details</p>
        <h2 class="section-title text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight">
          Full Event Experience
        </h2>
        <div class="divider-fire w-24 mx-auto mb-6"></div>
        <p class="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Check out everything you need to know about the Ikogosi Warm Spring Fire & Ice Escape
        </p>
      </div>

      <!-- Flyer Display -->
      <div class="reveal max-w-4xl mx-auto">
        <div
          @click="openLightbox"
          class="relative rounded-3xl overflow-hidden border-2 border-dark-500 hover:border-fire/50 transition-all duration-300 cursor-pointer group shadow-2xl"
        >
          <!-- Flyer Image -->
          <img
            src="/event-flyer.jpeg"
            alt="Ikogosi Warm Spring - Fire & Ice Escape Event Flyer"
            class="w-full h-auto group-hover:scale-105 transition-transform duration-500"
          />

          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div class="text-center">
              <div class="text-white text-xl font-bold mb-2">🔍 Click to View Full Size</div>
              <div class="text-gray-300 text-sm">See all event details</div>
            </div>
          </div>
        </div>

        <!-- Quick Info Pills -->
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <div class="flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-full px-5 py-3">
            <span class="text-xl">📅</span>
            <div class="text-left">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Date</div>
              <div class="text-white font-bold">23rd May</div>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-full px-5 py-3">
            <span class="text-xl">🚌</span>
            <div class="text-left">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Take-off</div>
              <div class="text-white font-bold">Akure</div>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-gradient-to-r from-fire/20 to-fire/10 border border-fire/40 rounded-full px-5 py-3">
            <span class="text-xl">🎟️</span>
            <div class="text-left">
              <div class="text-xs text-fire-mid uppercase tracking-wide font-semibold">Ticket</div>
              <div class="text-white font-bold">₦40,000</div>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-dark-800 border border-dark-500 rounded-full px-5 py-3">
            <span class="text-xl">🏨</span>
            <div class="text-left">
              <div class="text-xs text-gray-500 uppercase tracking-wide">Stay</div>
              <div class="text-white font-bold">Overnight Included</div>
            </div>
          </div>
        </div>

        <!-- Countdown Timer -->
        <div class="mt-10 p-8 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-fire/20">
          <div class="text-center mb-6">
            <p class="text-fire-mid text-xs tracking-[0.3em] uppercase font-bold mb-2">⏰ Event Starts In</p>
            <h3 class="text-white text-2xl font-display font-bold">Countdown to Adventure</h3>
          </div>

          <div class="grid grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div class="bg-dark-950 rounded-xl p-4 border border-dark-500">
              <div class="font-display font-black text-3xl sm:text-4xl text-white mb-1">{{ days }}</div>
              <div class="text-gray-500 text-xs uppercase tracking-wide">Days</div>
            </div>
            <div class="bg-dark-950 rounded-xl p-4 border border-fire/30">
              <div class="font-display font-black text-3xl sm:text-4xl text-fire-mid mb-1">{{ hours }}</div>
              <div class="text-gray-500 text-xs uppercase tracking-wide">Hours</div>
            </div>
            <div class="bg-dark-950 rounded-xl p-4 border border-ice/30">
              <div class="font-display font-black text-3xl sm:text-4xl text-ice mb-1">{{ minutes }}</div>
              <div class="text-gray-500 text-xs uppercase tracking-wide">Minutes</div>
            </div>
            <div class="bg-dark-950 rounded-xl p-4 border border-ice/40">
              <div class="font-display font-black text-3xl sm:text-4xl text-ice mb-1">{{ seconds }}</div>
              <div class="text-gray-500 text-xs uppercase tracking-wide">Seconds</div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="mt-8 text-center">
          <p class="text-gray-400 mb-3">For more enquiries contact:</p>
          <a
            href="tel:+2349035781670"
            class="inline-flex items-center gap-2 text-fire-mid hover:text-fire font-bold text-xl transition-colors"
          >
            <span>📞</span>
            <span>+234 903 578 1670</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="showLightbox"
          @click="closeLightbox"
          class="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            @click="closeLightbox"
            class="absolute top-4 right-4 text-white/70 hover:text-white text-4xl w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-all z-10"
            aria-label="Close"
          >
            ×
          </button>

          <div
            @click.stop
            class="relative max-w-5xl w-full max-h-[90vh] overflow-auto rounded-2xl"
          >
            <img
              src="/event-flyer.jpeg"
              alt="Ikogosi Warm Spring - Fire & Ice Escape Event Flyer"
              class="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
