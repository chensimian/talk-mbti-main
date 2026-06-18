<template>
  <div class="min-h-screen bg-gray-100 flex justify-center p-4">
    <!-- 居中卡片容器 -->
    <div class="w-full max-w-xl">
      <!-- 加载状态 -->
      <div v-if="!report" class="flex items-center justify-center min-h-[80vh]">
        <div class="text-center">
          <div class="text-5xl mb-4 animate-bounce">🔮</div>
          <p class="text-gray-400">加载报告中...</p>
        </div>
      </div>

      <div v-else>
        <!-- 顶部：MBTI 类型大卡 -->
        <div class="bg-white rounded-2xl shadow-lg text-center" style="padding: clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px); margin-bottom: 32px; margin-top: 16px;">
          <div class="font-black tracking-widest" style="font-size: clamp(48px, 12vw, 72px); margin-bottom: 20px;">
            <span :class="letterColor(0)">{{ report.type?.[0] }}</span>
            <span :class="letterColor(1)">{{ report.type?.[1] }}</span>
            <span :class="letterColor(2)">{{ report.type?.[2] }}</span>
            <span :class="letterColor(3)">{{ report.type?.[3] }}</span>
          </div>
          <p class="text-gray-500" style="font-size: clamp(16px, 4vw, 20px); margin-top: 8px;">{{ report.headline }}</p>
          <p v-if="report.portrait" class="text-gray-400 italic leading-relaxed" style="font-size: 16px; margin-top: 16px; padding: 0 12px;">{{ report.portrait }}</p>
          <div class="bg-purple-400 mx-auto rounded-full" style="width: 48px; height: 4px; margin-top: 28px;"></div>
        </div>

        <!-- 四维度 -->
        <ReportCard title="四维度解析" icon="📊" :delay="100">
          <div class="space-y-8">
            <DimensionBar
              v-for="(dim, key) in dimensionList"
              :key="key"
              :left-label="dim.left"
              :right-label="dim.right"
              :left-value="dim.leftVal"
              :right-value="dim.rightVal"
              :dominant="dim.dominant"
              :analysis="dim.analysis"
            />
          </div>
        </ReportCard>

        <!-- 认知功能栈 -->
        <ReportCard title="认知功能栈" icon="🧬" :delay="200">
          <div class="space-y-4">
            <div
              v-for="(fn, idx) in cognitiveList"
              :key="idx"
              class="flex items-center gap-4 p-4 rounded-xl"
              :class="cognitiveColors[idx]"
            >
              <div class="text-sm font-bold w-9 h-9 rounded-full flex items-center justify-center bg-white/70 shrink-0">
                {{ idx + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-sm">{{ fn.code }}</span>
                  <span class="text-sm text-gray-600">{{ fn.name }}</span>
                  <span class="text-xs text-gray-400 ml-auto">{{ cognitiveLabels[idx] }}</span>
                </div>
                <p class="text-sm text-gray-500">{{ fn.description }}</p>
              </div>
            </div>
          </div>
        </ReportCard>

        <!-- 超能力 -->
        <ReportCard title="你的超能力" icon="💪" :delay="300">
          <ul class="space-y-3">
            <li v-for="(s, i) in report.strengths" :key="i" class="flex items-start gap-3">
              <span class="text-green-500 mt-0.5 shrink-0 text-lg">✦</span>
              <span class="text-base text-gray-700 leading-relaxed">{{ s }}</span>
            </li>
          </ul>
        </ReportCard>

        <!-- 成长空间 -->
        <ReportCard title="成长空间" icon="🌱" :delay="400">
          <ul class="space-y-3">
            <li v-for="(g, i) in report.growthAreas" :key="i" class="flex items-start gap-3">
              <span class="text-orange-400 mt-0.5 shrink-0 text-lg">◆</span>
              <span class="text-base text-gray-700 leading-relaxed">{{ g }}</span>
            </li>
          </ul>
        </ReportCard>

        <!-- 边界维度提醒 -->
        <div
          v-if="report.borderlineDimensions?.length"
          class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">⚠️</span>
            <span class="font-semibold text-amber-700">边界维度提醒</span>
          </div>
          <ul class="space-y-2">
            <li v-for="(b, i) in report.borderlineDimensions" :key="i" class="text-sm text-amber-600">
              {{ b }}
            </li>
          </ul>
        </div>

        <!-- 总结 -->
        <ReportCard title="总结" icon="💡" :delay="500">
          <p class="text-base text-gray-600 leading-relaxed">{{ report.summary }}</p>
          <p class="text-sm text-gray-400 mt-4 italic">MBTI 是认识自己的一面镜子，不是一个盒子。</p>
        </ReportCard>

        <!-- 操作按钮 -->
        <div class="flex flex-col" style="gap: 20px; margin-top: 40px; margin-bottom: 36px;">
          <button
            @click="shareResult"
            class="w-full bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
            style="padding: 20px 0; font-size: 18px;"
          >
            {{ shareText }}
          </button>
          <button
            @click="retest"
            class="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            style="padding: 20px 0; font-size: 18px;"
          >
            重新测试
          </button>
          <button
            @click="showHistory = !showHistory"
            class="w-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            style="padding: 16px 0; font-size: 16px;"
          >
            {{ showHistory ? '收起对话记录 ↑' : '查看对话记录 ↓' }}
          </button>
        </div>

        <!-- 对话记录折叠 -->
        <div v-if="showHistory" class="mb-10 bg-white rounded-2xl p-5 shadow-sm">
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            class="flex items-start gap-3 py-3"
            :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
          >
            <div
              class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
              :class="msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'"
            >
              {{ msg.role === 'user' ? '🧑' : '🔮' }}
            </div>
            <div
              class="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
              :class="msg.role === 'user'
                ? 'bg-blue-50 text-gray-800 rounded-tr-sm'
                : 'bg-gray-50 text-gray-800 rounded-tl-sm'"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DimensionBar from '../components/DimensionBar.vue'
import ReportCard from '../components/ReportCard.vue'

const router = useRouter()
const report = ref(null)
const chatMessages = ref([])
const showHistory = ref(false)
const shareText = ref('分享结果')

const letterColors = [
  'text-purple-600', 'text-indigo-500', 'text-violet-500', 'text-fuchsia-500'
]
function letterColor(i) { return letterColors[i] || 'text-purple-600' }

const dimensionList = computed(() => {
  if (!report.value?.dimensions) return []
  const d = report.value.dimensions
  return [
    { left: 'E', right: 'I', leftVal: d.EI.E, rightVal: d.EI.I, dominant: d.EI.dominant, analysis: d.EI.analysis },
    { left: 'S', right: 'N', leftVal: d.SN.S, rightVal: d.SN.N, dominant: d.SN.dominant, analysis: d.SN.analysis },
    { left: 'T', right: 'F', leftVal: d.TF.T, rightVal: d.TF.F, dominant: d.TF.dominant, analysis: d.TF.analysis },
    { left: 'J', right: 'P', leftVal: d.JP.J, rightVal: d.JP.P, dominant: d.JP.dominant, analysis: d.JP.analysis },
  ]
})

const cognitiveLabels = ['主导功能', '辅助功能', '第三功能', '劣势功能']
const cognitiveColors = ['bg-purple-100', 'bg-indigo-50', 'bg-violet-50', 'bg-gray-50']
const cognitiveList = computed(() => {
  const s = report.value?.cognitiveStack
  if (!s) return []
  return [s.dominant, s.auxiliary, s.tertiary, s.inferior]
})

function shareResult() {
  const text = `我的 MBTI 是 ${report.value.type} — ${report.value.headline}\n快来测测你的：${window.location.origin}${window.location.pathname}`
  if (navigator.share) {
    navigator.share({ title: '我的 MBTI 结果', text, url: window.location.href }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => {
      shareText.value = '已复制到剪贴板!'
      setTimeout(() => { shareText.value = '分享结果' }, 2000)
    }).catch(() => {
      shareText.value = '复制失败'
      setTimeout(() => { shareText.value = '分享结果' }, 2000)
    })
  }
}

function retest() {
  sessionStorage.removeItem('mbti_report')
  sessionStorage.removeItem('mbti_messages')
  router.push('/tags')
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('mbti_report')
    if (raw) report.value = JSON.parse(raw)
    const msgs = sessionStorage.getItem('mbti_messages')
    if (msgs) chatMessages.value = JSON.parse(msgs)
  } catch (e) {
    console.error('解析报告失败:', e)
  }
  if (!report.value) router.push('/')
})
</script>
