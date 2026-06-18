<template>
  <div class="flex items-start gap-2" :class="isRight ? 'flex-row-reverse' : ''">
    <!-- 左侧百分比标签 -->
    <div class="shrink-0 text-center" :class="isRight ? 'text-right' : 'text-left'">
      <span class="text-xs font-bold" :class="leftDominant ? 'text-purple-600' : 'text-gray-400'">
        {{ leftLabel }}
      </span>
      <div class="text-lg font-black" :class="leftDominant ? 'text-purple-600' : 'text-gray-400'">
        {{ animatedLeft }}%
      </div>
    </div>

    <!-- 条形图 + 分析 -->
    <div class="flex-1">
      <div class="flex h-6 rounded-full overflow-hidden bg-gray-100 mb-2">
        <div
          class="transition-all duration-1000 ease-out rounded-l-full"
          :class="leftDominant ? 'bg-purple-500' : 'bg-gray-300'"
          :style="{ width: animatedLeft + '%' }"
        ></div>
        <div
          class="transition-all duration-1000 ease-out rounded-r-full"
          :class="!leftDominant ? 'bg-purple-500' : 'bg-gray-300'"
          :style="{ width: animatedRight + '%' }"
        ></div>
      </div>
      <p class="text-xs text-gray-500 leading-relaxed">{{ analysis }}</p>
    </div>

    <!-- 右侧百分比标签 -->
    <div class="shrink-0 text-center">
      <span class="text-xs font-bold" :class="!leftDominant ? 'text-purple-600' : 'text-gray-400'">
        {{ rightLabel }}
      </span>
      <div class="text-lg font-black" :class="!leftDominant ? 'text-purple-600' : 'text-gray-400'">
        {{ animatedRight }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  leftLabel: String,
  rightLabel: String,
  leftValue: Number,
  rightValue: Number,
  dominant: String,
  analysis: String,
})

const leftDominant = computed(() => props.dominant === props.leftLabel)
const isRight = ref(false)

// 数字滚动动画
const animatedLeft = ref(0)
const animatedRight = ref(0)

onMounted(() => {
  const duration = 1000
  const steps = 30
  const interval = duration / steps
  let step = 0

  const timer = setInterval(() => {
    step++
    const progress = step / steps
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    animatedLeft.value = Math.round(props.leftValue * eased)
    animatedRight.value = Math.round(props.rightValue * eased)
    if (step >= steps) {
      clearInterval(timer)
      animatedLeft.value = props.leftValue
      animatedRight.value = props.rightValue
    }
  }, interval)
})
</script>
