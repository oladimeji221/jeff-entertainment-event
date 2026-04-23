<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import EventDetails from '../components/EventDetails.vue'
import CountdownTimer from '../components/CountdownTimer.vue'
import LineupSection from '../components/LineupSection.vue'
import TicketSection from '../components/TicketSection.vue'
import FaqSection from '../components/FaqSection.vue'
import FooterSection from '../components/FooterSection.vue'
import PurchaseModal from '../components/PurchaseModal.vue'
import type { TicketType } from '../config/event'

const modalVisible = ref(false)
const modalType = ref<TicketType>('vip')

function openModal(type: TicketType = 'vip') {
  modalType.value = type
  modalVisible.value = true
}

// Intersection observer for scroll reveal animations
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="bg-dark-950 min-h-screen">
    <Navbar />
    <HeroSection @open-tickets="openModal()" />
    <EventDetails />
    <CountdownTimer />
    <LineupSection />
    <TicketSection @open-modal="openModal" />
    <FaqSection />
    <FooterSection />

    <PurchaseModal
      :visible="modalVisible"
      :initial-type="modalType"
      @close="modalVisible = false"
    />
  </div>
</template>
