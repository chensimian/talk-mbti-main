<template>
  <div class="flex items-center gap-2">
    <!-- 进度条 -->
    <div class="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
      <div
        class="h-full bg-white rounded-full transition-all duration-500 ease-out"
        :style="{ width: progress + '%' }"
      />
    </div>
    <!-- 轮次文字 -->
    <span class="text-white/90 text-xs font-medium whitespace-nowrap">
      {{ current }}/{{ max }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  current: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
})
</script>
