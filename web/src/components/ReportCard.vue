<template>
  <div
    ref="cardRef"
    class="bg-white rounded-2xl shadow-md transition-all duration-500"
    style="padding: 36px; margin-bottom: 32px;"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    :style="{ transitionDelay: delay + 'ms' }"
  >
    <div class="flex items-center" style="gap: 12px; margin-bottom: 24px;">
      <span style="font-size: 28px;">{{ icon }}</span>
      <h3 class="font-bold text-gray-800" style="font-size: 22px;">{{ title }}</h3>
    </div>
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: String,
  icon: String,
  delay: { type: Number, default: 0 },
})

const cardRef = ref(null)
const visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )
  if (cardRef.value) observer.observe(cardRef.value)
})
</script>
