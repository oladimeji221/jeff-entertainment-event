<script setup lang="ts">
const gallery = [
  {
    label: 'Warm Springs',
    img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
    tag: '♨️ Day Vibes',
    tagColor: '#FF9A00',
  },
  {
    label: 'Nature Walk',
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    tag: '🌿 Explore',
    tagColor: '#4CAF50',
  },
  {
    label: 'Campfire Night',
    img: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80',
    tag: '🔥 Night Vibes',
    tagColor: '#FF6B00',
  },
  {
    label: 'Connect & Chill',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    tag: '😊 Good Vibes',
    tagColor: '#00D4F5',
  },
  {
    label: 'BBQ & Grills',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    tag: '🍖 Night Vibes',
    tagColor: '#FF6B00',
  },
  {
    label: 'Cold Springs',
    img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80',
    tag: '❄️ Ikogosi Magic',
    tagColor: '#00D4F5',
  },
]
</script>

<template>
  <section id="lineup" class="py-24 px-4 bg-dark-950 relative overflow-hidden">
    <div class="absolute inset-0 opacity-20"
      style="background: radial-gradient(ellipse 60% 40% at 70% 50%, rgba(255,107,0,0.2) 0%, transparent 60%)"></div>

    <div class="relative z-10 max-w-7xl mx-auto">
      <div class="text-center mb-14 reveal">
        <p class="text-fire-mid text-xs tracking-[0.4em] uppercase font-medium mb-4">What Awaits You</p>
        <h2 class="section-title text-4xl sm:text-5xl lg:text-6xl">Experience Gallery</h2>
        <p class="text-gray-500 mt-4 max-w-lg mx-auto">A preview of the memories you'll make</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="(item, i) in gallery" :key="i"
          class="reveal group relative rounded-2xl overflow-hidden border border-dark-500 hover:border-fire/40 transition-all duration-300 hover:-translate-y-1 cursor-default"
          style="aspect-ratio: 4/3"
          :style="{ animationDelay: (i * 0.1) + 's' }"
        >
          <img :src="item.img" :alt="item.label"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute bottom-3 left-3 right-3">
            <div class="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1"
              :style="{ color: item.tagColor, backgroundColor: item.tagColor + '20', border: `1px solid ${item.tagColor}40` }">
              {{ item.tag }}
            </div>
            <div class="text-white font-semibold text-sm">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <p class="text-center text-gray-600 text-sm mt-10 italic">
        📸 Come alone, leave as family — Akure Outsiders
      </p>
    </div>
  </section>
</template>
