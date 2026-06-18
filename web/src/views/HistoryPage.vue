<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-20">
      <div class="mx-auto flex items-center" style="max-width: min(580px, 100%); padding: 16px 20px;">
        <button
          @click="$router.back()"
          class="text-gray-600 hover:text-gray-900 transition-colors"
          style="font-size: 20px; margin-right: 16px;"
        >
          ←
        </button>
        <h1 class="font-bold text-gray-800" style="font-size: 20px;">测试历史</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="mx-auto" style="max-width: min(580px, 100%); padding: 20px 16px;">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center" style="padding: 120px 0;">
        <div class="text-center">
          <div class="animate-bounce" style="font-size: 48px; margin-bottom: 16px;">🔮</div>
          <p class="text-gray-400" style="font-size: 16px;">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="records.length === 0" class="text-center" style="padding: 120px 0;">
        <div style="font-size: 64px; margin-bottom: 24px;">📭</div>
        <p class="text-gray-500 font-medium" style="font-size: 18px; margin-bottom: 8px;">还没有测试记录</p>
        <p class="text-gray-400" style="font-size: 14px; margin-bottom: 32px;">完成一次对话测试，结果会保存在这里</p>
        <button
          @click="$router.push('/tags')"
          class="bg-[#6C5CE7] text-white font-semibold rounded-xl hover:bg-[#5b4bd6] active:scale-[0.98] transition-all"
          style="padding: 16px 48px; font-size: 16px;"
        >
          开始测试
        </button>
      </div>

      <!-- 记录列表 -->
      <div v-else class="space-y-4">
        <div
          v-for="record in records"
          :key="record.id"
          @click="goToReport(record.id)"
          class="bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          style="padding: 24px 20px;"
        >
          <div class="flex items-center justify-between" style="margin-bottom: 12px;">
            <!-- MBTI 类型 -->
            <div class="font-black tracking-widest" style="font-size: 32px;">
              <span class="text-purple-600">{{ record.mbti_type?.[0] }}</span>
              <span class="text-indigo-500">{{ record.mbti_type?.[1] }}</span>
              <span class="text-violet-500">{{ record.mbti_type?.[2] }}</span>
              <span class="text-fuchsia-500">{{ record.mbti_type?.[3] }}</span>
            </div>
            <!-- 箭头 -->
            <span class="text-gray-300" style="font-size: 20px;">›</span>
          </div>
          <!-- headline -->
          <p class="text-gray-600" style="font-size: 15px; margin-bottom: 10px;">{{ record.headline }}</p>
          <!-- 时间 -->
          <p class="text-gray-400" style="font-size: 13px;">{{ formatTime(record.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthGlobal } from '../composables/useAuth'

const router = useRouter()
const auth = useAuthGlobal()

const loading = ref(true)
const records = ref([])

function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${min}`
}

function goToReport(id) {
  router.push({ path: '/report', query: { id } })
}

onMounted(async () => {
  if (!supabase) {
    loading.value = false
    return
  }

  try {
    const userId = auth.getEffectiveUserId()
    const { data, error } = await supabase
      .from('mbti_results')
      .select('id, mbti_type, headline, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      records.value = data
    }
  } catch (e) {
    console.error('[History] 加载失败:', e)
  } finally {
    loading.value = false
  }
})
</script>
