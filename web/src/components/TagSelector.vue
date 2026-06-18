<template>
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-2xl">{{ category.icon }}</span>
      <h3 class="text-lg font-semibold text-gray-800">{{ category.label }}</h3>
      <span
        v-if="category.type === 'multi'"
        class="text-xs text-gray-400 ml-auto"
      >
        {{ selectedCount }}/{{ category.maxSelect }}
      </span>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in category.options"
        :key="option"
        @click="toggle(option)"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer"
        :class="
          isSelected(option)
            ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md shadow-purple-200 scale-105'
            : 'bg-white text-gray-600 border-gray-200 hover:border-[#6C5CE7] hover:text-[#6C5CE7]'
        "
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Array],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const selectedCount = computed(() => {
  if (props.category.type === 'multi' && Array.isArray(props.modelValue)) {
    return props.modelValue.length
  }
  return 0
})

function isSelected(option) {
  if (props.category.type === 'multi') {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option)
  }
  return props.modelValue === option
}

function toggle(option) {
  if (props.category.type === 'single') {
    // 单选：再次点击取消选中
    emit('update:modelValue', props.modelValue === option ? '' : option)
  } else {
    // 多选
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.indexOf(option)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else if (current.length < (props.category.maxSelect || Infinity)) {
      current.push(option)
    }
    emit('update:modelValue', current)
  }
}
</script>
