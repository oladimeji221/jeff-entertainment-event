<script setup lang="ts">
import { EVENT } from '../config/event'

const socialLinks = [
  { icon: 'IG', href: EVENT.social.instagram },
  { icon: 'X',  href: EVENT.social.twitter   },
  { icon: 'FB', href: EVENT.social.facebook  },
  { icon: 'WA', href: EVENT.social.whatsapp  },
]

const footerLinks = [
  { id: 'about',   label: 'About The Trip' },
  { id: 'vibes',   label: 'Day & Night Vibes' },
  { id: 'tickets', label: 'Book Tickets' },
  { id: 'faq',     label: 'FAQ' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <footer class="bg-dark-950 border-t border-dark-600 pt-16 pb-8 px-4">
    <div class="max-w-7xl mx-auto">

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
        <!-- Brand -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <img src="/jeff.jpg" alt="Jeff Entertainment" class="h-12 w-auto object-contain shadow-lg" />
            <div>
              <div class="font-display font-bold text-xl text-white">{{ EVENT.organizerName }}</div>
              <div class="text-gray-600 text-xs tracking-wider">We Move Different</div>
            </div>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed max-w-xs mb-2">
            <strong class="text-white">{{ EVENT.eventName }}</strong> — Fire &amp; Ice Escape.<br>
            {{ EVENT.venue }}, {{ EVENT.city }}
          </p>
          <p class="text-gray-600 text-xs italic mb-6">"Come alone, leave as family."</p>

          <!-- Social icons -->
          <div class="flex items-center gap-3">
            <a v-for="s in socialLinks" :key="s.icon" :href="s.href" target="_blank"
              class="w-9 h-9 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-fire-mid hover:border-fire/40 transition-all text-xs font-bold">
              {{ s.icon }}
            </a>
          </div>
        </div>

        <!-- Quick links -->
        <div>
          <div class="text-fire-mid text-xs tracking-[0.3em] uppercase font-medium mb-5">Quick Links</div>
          <ul class="space-y-3">
            <li v-for="link in footerLinks" :key="link.id">
              <button @click="scrollTo(link.id)" class="text-gray-500 hover:text-fire-mid text-sm transition-colors">{{ link.label }}</button>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <div class="text-fire-mid text-xs tracking-[0.3em] uppercase font-medium mb-5">Contact</div>
          <div class="space-y-3 text-sm text-gray-500">
            <div>📧 <a :href="`mailto:${EVENT.contact.email}`" class="hover:text-fire-mid transition-colors">{{ EVENT.contact.email }}</a></div>
            <div>📞 <a :href="`tel:${EVENT.contact.phone}`" class="hover:text-fire-mid transition-colors">{{ EVENT.contact.phone }}</a></div>
            <div>🚌 Take-off from <span class="text-white">{{ EVENT.takeOff }}</span></div>
            <div>📍 {{ EVENT.venue }}</div>
          </div>
        </div>
      </div>

      <div class="divider-fire opacity-20 mb-8"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <span>© {{ new Date().getFullYear() }} {{ EVENT.organizerName }}. All rights reserved.</span>
        <div class="flex items-center gap-2">
          <span>🔥 Fire &amp; Ice Escape</span>
          <span>·</span>
          <span>Powered by <span class="text-fire-mid">Paystack</span></span>
        </div>
      </div>
    </div>
  </footer>
</template>
