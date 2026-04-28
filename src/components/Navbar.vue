<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EVENT } from '../config/event'

const isScrolled = ref(false)
const mobileOpen = ref(false)
const navLinks = [
  { id: 'about',   label: 'About'   },
  { id: 'vibes',   label: 'Vibes'   },
  { id: 'tickets', label: 'Tickets' },
  { id: 'faq',     label: 'FAQ'     },
]

const onScroll = () => { isScrolled.value = window.scrollY > 60 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function scrollTo(id: string) {
  mobileOpen.value = false
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
}
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="isScrolled
      ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl border-b border-dark-600'
      : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">

        <!-- Logo -->
        <button @click="scrollTo('hero')" class="flex items-center gap-3 group">
          <img src="/logo.jpg" alt="Jeff Entertainment"
            class="h-10 w-auto object-contain shadow-lg group-hover:scale-110 transition-transform" />
          <span class="hidden sm:block font-display font-black text-base tracking-wide"
            style="background:linear-gradient(135deg,#FFD400,#FF9A00,#FF6B00); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            {{ EVENT.organizerName }}
          </span>
        </button>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8">
          <button v-for="link in navLinks" :key="link.id" @click="scrollTo(link.id)"
            class="text-gray-400 hover:text-fire-mid transition-colors text-sm font-medium tracking-widest uppercase">
            {{ link.label }}
          </button>
        </div>

        <!-- CTA + hamburger -->
        <div class="flex items-center gap-3">
          <button @click="scrollTo('tickets')"
            class="btn-fire px-5 py-2 text-sm hidden sm:inline-flex">
            🔥 Book Now
          </button>
          <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <Transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden bg-dark-800/98 backdrop-blur-xl border-t border-dark-600">
        <div class="px-6 py-6 flex flex-col gap-5">
          <button v-for="link in navLinks" :key="link.id" @click="scrollTo(link.id)"
            class="text-left text-gray-300 hover:text-fire-mid text-sm font-medium tracking-widest uppercase py-1">
            {{ link.label }}
          </button>
          <button @click="() => { mobileOpen = false; scrollTo('tickets') }" class="btn-fire w-full py-3 text-sm mt-2">
            🔥 Book Your Spot
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
