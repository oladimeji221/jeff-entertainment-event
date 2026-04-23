<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { EVENT } from '../config/event'

const emit = defineEmits<{ (e: 'openTickets'): void }>()

// ── Mouse parallax ─────────────────────────────────────────────────────
const heroRef   = ref<HTMLElement | null>(null)
const mouseX    = ref(0)
const mouseY    = ref(0)
let   rafPending = false

function onMouseMove(e: MouseEvent) {
  if (!heroRef.value || rafPending) return
  rafPending = true
  requestAnimationFrame(() => {
    if (!heroRef.value) return
    const r = heroRef.value.getBoundingClientRect()
    mouseX.value = ((e.clientX - r.left) / r.width  - 0.5) * 2
    mouseY.value = ((e.clientY - r.top)  / r.height - 0.5) * 2
    rafPending = false
  })
}
function onMouseLeave() { mouseX.value = 0; mouseY.value = 0 }

// ── Gyro for mobile ────────────────────────────────────────────────────
function onDeviceOrientation(e: DeviceOrientationEvent) {
  mouseX.value = ((e.gamma ?? 0) / 30)
  mouseY.value = ((e.beta  ?? 0) / 30)
}
onMounted(() => window.addEventListener('deviceorientation', onDeviceOrientation as any))
onUnmounted(() => window.removeEventListener('deviceorientation', onDeviceOrientation as any))

// ── Particles ──────────────────────────────────────────────────────────
interface Particle {
  id: number; x: number; size: number; delay: number; duration: number
  color: string; drift: number; type: 'fire' | 'ice'
}
const particles = ref<Particle[]>([])

onMounted(() => {
  const fireColors = ['#FF6B00','#FF8C00','#FF9A00','#FFD400','#FF4500']
  const iceColors  = ['#00D4F5','#4DD9F5','#A8F0FF','#00B8D4','#7FEFFF']
  const ps: Particle[] = []

  for (let i = 0; i < 28; i++) {
    ps.push({ id: i, x: Math.random() * 100, size: Math.random() * 5 + 2,
      delay: Math.random() * 10, duration: Math.random() * 5 + 4,
      color: fireColors[i % fireColors.length] ?? '#FF6B00', drift: (Math.random() - 0.5) * 60, type: 'fire' })
  }
  for (let i = 28; i < 50; i++) {
    ps.push({ id: i, x: Math.random() * 100, size: Math.random() * 4 + 1,
      delay: Math.random() * 12, duration: Math.random() * 6 + 5,
      color: iceColors[i % iceColors.length] ?? '#00D4F5', drift: (Math.random() - 0.5) * 50, type: 'ice' })
  }
  particles.value = ps
})

function scrollDown() {
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
}
function scrollToAbout() {
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section
    ref="heroRef"
    id="hero"
    class="relative min-h-screen flex items-center justify-center overflow-hidden select-none"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- ── Base dark bg ── -->
    <div class="absolute inset-0 bg-dark-950"></div>

    <!-- ── BG image layer (parallax deepest) ── -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{
        backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80)',
        transform: `scale(1.12) translate(${mouseX * -15}px, ${mouseY * -10}px)`,
        opacity: 0.28,
        transition: 'transform 0.12s linear',
      }"
    ></div>

    <!-- ── Split tint: fire left / ice right ── -->
    <div class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(105deg, rgba(255,107,0,0.12) 0%, transparent 42%, rgba(0,212,245,0.10) 100%)"></div>

    <!-- ── Fire glow — bottom ── -->
    <div class="absolute bottom-0 inset-x-0 h-72 pointer-events-none"
      style="background: radial-gradient(ellipse 80% 100% at 50% 110%, rgba(255,107,0,0.45) 0%, rgba(255,107,0,0.08) 55%, transparent 70%);
             animation: fireGlowPulse 3s ease-in-out infinite;"></div>

    <!-- ── Ice glow — top corners ── -->
    <div class="absolute top-0 left-0 w-80 h-80 pointer-events-none"
      style="background: radial-gradient(circle at 0% 0%, rgba(0,212,245,0.18) 0%, transparent 65%)"></div>
    <div class="absolute top-0 right-0 w-80 h-80 pointer-events-none"
      style="background: radial-gradient(circle at 100% 0%, rgba(0,212,245,0.18) 0%, transparent 65%)"></div>

    <!-- ── Grid overlay ── -->
    <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
      style="background-image: linear-gradient(rgba(255,154,0,0.8) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,154,0,0.8) 1px, transparent 1px);
             background-size: 70px 70px;"></div>

    <!-- ── Particles ── -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Fire -->
      <div v-for="p in particles.filter(p => p.type === 'fire')" :key="'f'+p.id"
        class="absolute rounded-full"
        :style="{
          left: p.x + '%', bottom: '-8px',
          width: p.size + 'px', height: p.size + 'px',
          background: p.color,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          '--drift': p.drift + 'px',
          animation: `fireRiseParticle ${p.duration}s linear ${p.delay}s infinite`,
        } as any"
      ></div>
      <!-- Ice -->
      <div v-for="p in particles.filter(p => p.type === 'ice')" :key="'i'+p.id"
        class="absolute"
        :style="{
          left: p.x + '%', top: '-8px',
          width: p.size + 'px', height: p.size + 'px',
          background: p.color,
          borderRadius: '2px',
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `iceDriftParticle ${p.duration}s linear ${p.delay}s infinite`,
        }"
      ></div>
    </div>

    <!-- ── 3D Scene ── -->
    <div
      class="relative z-10 text-center px-4 max-w-5xl mx-auto scene-3d"
      :style="{
        transform: `perspective(1100px) rotateY(${mouseX * 4}deg) rotateX(${-mouseY * 3}deg)`,
        transformStyle: 'preserve-3d',
      }"
    >
      <!-- Presenter line -->
      <p class="text-xs sm:text-sm tracking-[0.5em] uppercase font-bold mb-5 opacity-0 animate-fade-up"
        style="animation-delay:0.2s; animation-fill-mode:forwards; color:#FF9A00; text-shadow: 0 0 20px rgba(255,154,0,0.6)">
        {{ EVENT.eventPresenter }} presents
      </p>

      <!-- 3D title block -->
      <div class="opacity-0 animate-fade-up" style="animation-delay:0.4s; animation-fill-mode:forwards; transform:translateZ(50px)">
        <!-- IKOGOSI — 3D extruded fire text -->
        <h1 class="font-display font-black leading-none uppercase tracking-tight"
          style="
            font-size: clamp(3.8rem, 13vw, 10rem);
            color: #fff;
            text-shadow:
              0 1px 0 #FF9A00, 0 2px 0 #FF8000, 0 3px 0 #FF6500,
              0 4px 0 #CC4400, 0 5px 0 #992200, 0 6px 0 #661100,
              0 8px 18px rgba(0,0,0,0.9), 0 0 50px rgba(255,107,0,0.25);
          ">
          IKOGOSI
        </h1>

        <!-- WARM SPRINGS — 3D ice text -->
        <h2 class="font-display font-black leading-none uppercase"
          style="
            font-size: clamp(1.5rem, 5.5vw, 4.5rem);
            letter-spacing: 0.12em;
            color: #E0F8FF;
            text-shadow:
              0 1px 0 #4DD9F5, 0 2px 0 #00B8D4, 0 3px 0 #007FA0,
              0 5px 0 #004060, 0 7px 16px rgba(0,0,0,0.8), 0 0 40px rgba(0,212,245,0.3);
          ">
          WARM SPRINGS
        </h2>
      </div>

      <!-- Fire & Ice tag -->
      <div class="my-7 opacity-0 animate-fade-up" style="animation-delay:0.65s; animation-fill-mode:forwards">
        <div class="inline-flex items-center gap-3 px-7 py-2.5 rounded-full border border-white/10 bg-black/35 backdrop-blur-sm">
          <span class="text-xl">🔥</span>
          <span class="font-display font-bold italic"
            style="font-size:clamp(1rem,2.8vw,1.5rem); background:linear-gradient(90deg,#FF6B00,#FF9A00,#FFD400); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            Fire
          </span>
          <span class="text-white/30 font-bold text-lg">&amp;</span>
          <span class="font-display font-bold italic"
            style="font-size:clamp(1rem,2.8vw,1.5rem); background:linear-gradient(90deg,#00D4F5,#4DD9F5,#A8F0FF); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            Ice Escape
          </span>
          <span class="text-xl">🧊</span>
        </div>
      </div>

      <!-- Sub-tagline -->
      <p class="font-display italic mb-9 opacity-0 animate-fade-up"
        style="animation-delay:0.8s; animation-fill-mode:forwards; color:rgba(255,255,255,0.65); font-size:clamp(0.9rem,2vw,1.2rem);">
        "{{ EVENT.subTagline }}"
      </p>

      <!-- Info pills -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-11 opacity-0 animate-fade-up"
        style="animation-delay:0.95s; animation-fill-mode:forwards">
        <div class="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
          <span>🚌</span><span class="text-gray-300">Take-off: {{ EVENT.takeOff }}</span>
        </div>
        <div class="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
          <span>♨️</span><span class="text-gray-300">{{ EVENT.venue }}</span>
        </div>
        <div class="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
          <span>🌙</span><span class="text-gray-300">Overnight stay included</span>
        </div>
        <div class="flex items-center gap-2 bg-orange-900/40 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 text-sm">
          <span>⚠️</span><span class="text-orange-300 font-semibold">Limited Slots!</span>
        </div>
      </div>

      <!-- CTA buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up"
        style="animation-delay:1.1s; animation-fill-mode:forwards; transform:translateZ(40px)">
        <button @click="emit('openTickets')"
          class="btn-fire w-full sm:w-auto px-10 py-4 text-base font-bold tracking-wide">
          🔥 Book Your Spot — ₦40K
        </button>
        <button @click="scrollToAbout"
          class="btn-ice w-full sm:w-auto px-10 py-4 text-base font-bold">
          ❄️ Explore the Trip
        </button>
      </div>
    </div>

    <!-- Scroll indicator -->
    <button @click="scrollDown"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-white/70 transition-colors">
      <span class="text-xs tracking-widest uppercase">Scroll</span>
      <div class="w-6 h-10 border-2 border-current rounded-full flex items-start justify-center p-1">
        <div class="w-1.5 h-3 bg-current rounded-full animate-bounce"></div>
      </div>
    </button>
  </section>
</template>
