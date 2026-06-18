<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center" style="padding: 20px;">
    <div class="w-full bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden" style="max-width: min(580px, 100%); min-height: 90vh;">
      <!-- 顶部跳过 -->
      <div class="flex justify-end shrink-0" style="padding: 24px 32px 8px;">
        <button
          @click="skipAll"
          class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          style="font-size: 14px; padding: 8px 16px;"
        >
          跳过全部 →
        </button>
      </div>

      <!-- 主内容区 -->
      <div class="flex-1 flex flex-col items-center justify-center" style="padding: 0 clamp(16px, 4vw, 48px);">
        <transition name="slide" mode="out-in">
          <!-- 标签分类步骤 -->
          <div v-if="currentStep < filteredCategories.length" :key="currentStep" class="w-full">
            <div class="text-center" style="margin-bottom: 48px;">
              <div style="font-size: clamp(48px, 12vw, 72px); margin-bottom: 28px;">{{ currentCategory.icon }}</div>
              <h2 class="font-bold text-gray-900" style="font-size: clamp(20px, 5vw, 26px); margin-bottom: 16px;">
                {{ currentCategory.label }}
                <span class="font-normal text-gray-400" style="font-size: 14px; margin-left: 8px;">
                  （{{ currentCategory.type === 'multi' ? '多选' : '单选' }}）
                </span>
              </h2>
              <p class="text-gray-400" style="font-size: 16px;">
                {{ currentCategory.type === 'multi' ? `最多选 ${currentCategory.maxSelect} 个` : '选你最符合的' }}
              </p>
            </div>

            <!-- 标签按钮 -->
            <div
              class="grid"
              :class="currentCategory.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'"
              style="gap: 16px; margin-bottom: 40px;"
            >
              <button
                v-for="option in currentCategory.options"
                :key="option"
                @click="toggleOption(option)"
                class="rounded-xl font-medium border-2 transition-all duration-150 cursor-pointer select-none"
                style="padding: clamp(12px, 3vw, 18px) clamp(14px, 3.5vw, 20px); font-size: clamp(14px, 3.5vw, 16px);"
                :class="isSelected(option)
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 自定义标签步骤 -->
          <div v-else-if="currentStep === filteredCategories.length" :key="'custom'" class="w-full text-center">
            <div style="font-size: clamp(48px, 12vw, 72px); margin-bottom: 28px;">✏️</div>
            <h2 class="font-bold text-gray-900" style="font-size: clamp(20px, 5vw, 26px); margin-bottom: 16px;">还有什么想说的？</h2>
            <p class="text-gray-400" style="font-size: 16px; margin-bottom: 40px;">随便补充一句，让 AI 更了解你（可跳过）</p>

            <input
              v-model="customTag"
              type="text"
              placeholder="比如「猫奴」「社恐晚期」「咖啡续命」"
              class="w-full rounded-xl border-2 border-gray-200 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-center"
              style="padding: 20px 24px; font-size: 18px; margin-bottom: 40px;"
              @keyup.enter="handleStart"
            />
          </div>
        </transition>
      </div>

      <!-- 底部导航栏 -->
      <div class="flex items-center justify-between border-t border-gray-100 shrink-0" style="padding: clamp(12px, 3vw, 20px) clamp(16px, 4vw, 32px);">
        <!-- 上一步 -->
        <button
          @click="prev"
          :disabled="currentStep === 0"
          class="rounded-full border-2 transition-all shrink-0"
          style="padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px); font-size: clamp(13px, 3.2vw, 15px);"
          :class="currentStep > 0
            ? 'border-gray-300 text-gray-600 hover:border-gray-500 cursor-pointer'
            : 'border-gray-100 text-gray-200 cursor-default'"
        >
          ‹ 上一步
        </button>

        <!-- 进度 -->
        <div class="flex items-center" style="gap: 8px;">
          <div class="rounded-full overflow-hidden" style="width: clamp(48px, 12vw, 80px); height: 6px; background: #f0f0f0;">
            <div
              class="h-full rounded-full transition-all duration-500"
              style="background: #333;"
              :style="{ width: ((currentStep + 1) / allSteps.length * 100) + '%' }"
            ></div>
          </div>
          <span class="text-gray-400 tabular-nums shrink-0" style="font-size: 13px;">{{ currentStep + 1 }}/{{ allSteps.length }}</span>
        </div>

        <!-- 下一步 -->
        <button
          @click="nextOrStart"
          class="rounded-full border-2 border-gray-800 bg-gray-800 text-white hover:bg-gray-700 active:scale-95 transition-all cursor-pointer shrink-0"
          style="padding: clamp(8px, 2vw, 12px) clamp(16px, 4vw, 28px); font-size: clamp(13px, 3.2vw, 15px);"
        >
          {{ currentStep < filteredCategories.length ? (hasSelection ? '下一步 ›' : '跳过 ›') : '开始对话 🔮' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TAG_CATEGORIES } from '../constants/tags'

const router = useRouter()
const route = useRoute()
const currentStep = ref(0)
const customTag = ref('')

// 学生版跳过职业方向标签
const mode = computed(() => route.query.mode || 'standard')
const filteredCategories = computed(() => {
  if (mode.value === 'student') {
    return TAG_CATEGORIES.filter(cat => cat.id !== 'career')
  }
  return TAG_CATEGORIES
})

const selections = reactive({})
TAG_CATEGORIES.forEach((cat) => {
  selections[cat.id] = cat.type === 'multi' ? [] : ''
})

const allSteps = computed(() => [...filteredCategories.value, { id: 'custom' }])
const currentCategory = computed(() => filteredCategories.value[currentStep.value])

const hasSelection = computed(() => {
  if (currentStep.value >= TAG_CATEGORIES.length) return !!customTag.value.trim()
  const cat = currentCategory.value
  const val = selections[cat.id]
  return cat.type === 'multi' ? val.length > 0 : !!val
})

function isSelected(option) {
  const cat = currentCategory.value
  if (cat.type === 'multi') return selections[cat.id].includes(option)
  return selections[cat.id] === option
}

function toggleOption(option) {
  const cat = currentCategory.value
  if (cat.type === 'single') {
    selections[cat.id] = selections[cat.id] === option ? '' : option
  } else {
    const arr = selections[cat.id]
    const idx = arr.indexOf(option)
    if (idx >= 0) {
      arr.splice(idx, 1)
    } else if (arr.length < (cat.maxSelect || Infinity)) {
      arr.push(option)
    }
  }
}

function next() { if (currentStep.value < filteredCategories.value.length) currentStep.value++ }
function prev() { if (currentStep.value > 0) currentStep.value-- }

function skipAll() {
  sessionStorage.setItem('mbti_tags', JSON.stringify({}))
  const mode = route.query.mode || 'standard'
  sessionStorage.setItem('mbti_mode', mode)
  router.push('/chat')
}

function handleStart() {
  const result = {}
  filteredCategories.value.forEach((cat) => {
    const val = selections[cat.id]
    if (cat.type === 'multi' && Array.isArray(val) && val.length > 0) result[cat.id] = [...val]
    else if (cat.type === 'single' && val) result[cat.id] = val
  })
  if (customTag.value.trim()) result.custom = customTag.value.trim()
  sessionStorage.setItem('mbti_tags', JSON.stringify(result))
  const mode = route.query.mode || 'standard'
  sessionStorage.setItem('mbti_mode', mode)
  router.push('/chat')
}

function nextOrStart() {
  if (currentStep.value === filteredCategories.value.length) handleStart()
  else next()
}
</script>

<style>
.slide-enter-active, .slide-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from { opacity: 0; transform: translateX(30px); }
.slide-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
