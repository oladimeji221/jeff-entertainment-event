<script setup lang="ts">
import { ref } from 'vue'
import { EVENT } from '../config/event'

const faqs = [
  {
    q: 'What exactly is included in the ticket price?',
    a: 'Your ticket covers the full day trip to Ikogosi Warm Springs, overnight accommodation, transport from the Akure take-off point, access to both warm and cold springs, nature walk, campfire night, BBQ & grills, drinks, games, and music. It is truly an all-in experience.',
  },
  {
    q: 'Where and what time is the take-off?',
    a: `Take-off is from Akure. The exact meeting point and departure time will be communicated to all ticket holders via WhatsApp after booking. Follow our Instagram for announcements.`,
  },
  {
    q: 'When will the date be announced?',
    a: 'The date is being finalised and will be announced very soon. We strongly recommend booking now as slots are strictly limited — the date announcement usually triggers a rush.',
  },
  {
    q: 'Is the overnight stay in a hotel or camping?',
    a: 'The Ikogosi Warm Springs resort has accommodation facilities. Exact lodging details will be shared with confirmed ticket holders. Pack light — bring essentials for one night.',
  },
  {
    q: 'What should I wear / bring?',
    a: 'Casual, comfortable outdoor wear. Bring a swimsuit for the springs, a change of clothes, toiletries for overnight, camera/phone for content, and your best energy! Dress code: casual & comfortable.',
  },
  {
    q: 'How do I receive my ticket after payment?',
    a: 'Immediately after your Paystack payment is confirmed, you will be redirected to your ticket page with a unique QR code. Screenshot or download it — you will need to present it at the take-off point.',
  },
  {
    q: 'Can I buy tickets for friends?',
    a: 'Yes! Select the quantity you need when purchasing. Each order generates one ticket showing the total quantity booked. All names in a group should be present at take-off with the QR code.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Tickets are non-refundable but transferable. If you cannot attend, you may give your ticket to someone else. Just inform us via DM before the event date.',
  },
]

const open = ref<number | null>(null)
</script>

<template>
  <section id="faq" class="py-24 px-4 bg-dark-950">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-14 reveal">
        <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-4">Got Questions?</p>
        <h2 class="section-title text-4xl sm:text-5xl">All You Need to Know</h2>
      </div>

      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i"
          class="reveal card-dark overflow-hidden transition-colors"
          :class="open === i ? 'border-fire/40' : 'hover:border-dark-400'">
          <button class="w-full flex items-center justify-between gap-4 p-6 text-left"
            @click="open = open === i ? null : i">
            <span class="font-medium text-white text-sm sm:text-base">{{ faq.q }}</span>
            <span class="flex-shrink-0 w-7 h-7 rounded-full border border-dark-400 flex items-center justify-center transition-all duration-300 text-fire-mid"
              :class="open === i ? 'rotate-45 border-fire/60' : ''">+</span>
          </button>
          <Transition name="accordion">
            <div v-if="open === i" class="px-6 pb-6 text-gray-400 text-sm leading-relaxed">{{ faq.a }}</div>
          </Transition>
        </div>
      </div>

      <div class="text-center mt-12 p-6 rounded-2xl border border-ice/20 bg-ice/5 reveal">
        <p class="text-gray-400 text-sm mb-3">Still have questions? Reach out directly</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a :href="EVENT.social.whatsapp" target="_blank" class="btn-fire px-6 py-2.5 text-sm font-bold">
            💬 WhatsApp Us
          </a>
          <a :href="`mailto:${EVENT.contact.email}`" class="btn-ice px-6 py-2.5 text-sm font-bold">
            📧 Email Us
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.accordion-enter-active, .accordion-leave-active { transition: all 0.3s ease; max-height: 300px; overflow: hidden; }
.accordion-enter-from, .accordion-leave-to { max-height: 0; opacity: 0; }
</style>
