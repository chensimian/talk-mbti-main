<template>
  <div class="min-h-screen bg-gray-100 flex justify-center p-4">
    <div class="w-full max-w-xl">
      <!-- 加载状态 -->
      <div v-if="!report" class="flex items-center justify-center min-h-[80vh]">
        <div class="text-center">
          <div class="text-5xl mb-4 animate-bounce">🔮</div>
          <p class="text-gray-400">加载命理报告中...</p>
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

        <!-- 八字展示卡 -->
        <ReportCard title="八字四柱" icon="🏮" :delay="50">
          <div class="flex justify-center" style="gap: 20px;">
            <div
              v-for="(pillar, idx) in baziPillars"
              :key="idx"
              class="text-center"
            >
              <p class="text-gray-400" style="font-size: 12px; margin-bottom: 8px;">{{ pillar.label }}</p>
              <div
                class="rounded-xl flex flex-col items-center justify-center"
                style="width: 72px; height: 100px; border: 2px solid #d4a574; background: linear-gradient(180deg, #fef9f0 0%, #fdf2e3 100%);"
              >
                <span
                  class="font-black"
                  style="font-size: 28px; color: #8b4513; line-height: 1.2;"
                >{{ pillar.top }}</span>
                <div style="width: 40px; height: 1px; background: #d4a574; margin: 4px 0;"></div>
                <span
                  class="font-black"
                  style="font-size: 28px; color: #c0392b; line-height: 1.2;"
                >{{ pillar.bottom }}</span>
              </div>
            </div>
          </div>
        </ReportCard>

        <!-- 付费拦截：未付费则显示付费弹窗遮罩 -->
        <div v-if="!hasPaid" class="relative" style="margin-top: 8px;">
          <!-- 模糊预览 -->
          <div style="filter: blur(8px); pointer-events: none; user-select: none; opacity: 0.5;">
            <ReportCard title="五行分析" icon="☯️">
              <div style="height: 120px; background: linear-gradient(180deg, #f8f8f8, #eee); border-radius: 12px;"></div>
            </ReportCard>
            <ReportCard title="MBTI × 命理交叉分析" icon="🔗">
              <div style="height: 80px; background: linear-gradient(180deg, #f8f8f8, #eee); border-radius: 12px;"></div>
            </ReportCard>
            <ReportCard title="运势洞察" icon="🌟">
              <div style="height: 80px; background: linear-gradient(180deg, #f8f8f8, #eee); border-radius: 12px;"></div>
            </ReportCard>
          </div>

          <!-- 付费卡片覆盖 -->
          <div
            class="absolute inset-0 flex items-center justify-center"
            style="background: rgba(255,255,255,0.85); backdrop-filter: blur(2px); border-radius: 16px;"
          >
            <div class="bg-white rounded-2xl shadow-2xl text-center" style="padding: 40px 32px; max-width: 360px; width: 90%;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
              <h3 class="font-bold text-gray-900" style="font-size: 22px; margin-bottom: 8px;">解锁完整命理报告</h3>
              <p class="text-gray-500" style="font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
                包含五行分析、交叉解读、运势洞察、人际匹配等全部内容
              </p>
              <div class="font-black text-purple-600" style="font-size: 36px; margin-bottom: 20px;">¥9.9</div>

              <!-- 收款二维码 -->
              <div style="margin-bottom: 20px;">
                <img
                  src="/pay-qrcode.jpg"
                  alt="收款二维码"
                  style="width: 200px; height: 200px; margin: 0 auto; border-radius: 12px; border: 2px solid #f0f0f0;"
                  onerror="this.style.display='none'"
                />
                <p class="text-gray-400" style="font-size: 12px; margin-top: 8px;">扫码支付 ¥9.9</p>
              </div>

              <button
                @click="confirmPaid"
                class="w-full bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all cursor-pointer"
                style="padding: 16px 0; font-size: 17px;"
              >
                我已支付，查看报告 →
              </button>
              <p class="text-gray-400" style="font-size: 12px; margin-top: 12px;">支付后自动解锁全部内容</p>
            </div>
          </div>
        </div>

        <!-- 已付费：显示完整内容 -->
        <template v-if="hasPaid">

        <!-- 五行分析卡 -->
        <ReportCard title="五行分析" icon="☯️" :delay="100">
          <div style="margin-bottom: 20px;">
            <div
              v-for="element in wuxingBars"
              :key="element.name"
              class="flex items-center"
              style="margin-bottom: 12px; gap: 12px;"
            >
              <span class="font-bold shrink-0" style="width: 32px; font-size: 16px;" :style="{ color: element.color }">
                {{ element.name }}
              </span>
              <div class="flex-1 bg-gray-100 rounded-full" style="height: 24px; overflow: hidden;">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: (element.value / 5 * 100) + '%',
                    backgroundColor: element.color,
                    minWidth: element.value > 0 ? '8%' : '0'
                  }"
                ></div>
              </div>
              <span class="text-gray-500 shrink-0" style="font-size: 14px; width: 20px; text-align: right;">
                {{ element.value }}
              </span>
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed" style="font-size: 15px;">{{ report.wuxing?.analysis }}</p>
        </ReportCard>

        <!-- MBTI × 八字交叉分析 -->
        <ReportCard title="MBTI × 命理交叉分析" icon="🔗" :delay="150">
          <p class="text-gray-600 leading-relaxed" style="font-size: 15px;">{{ report.crossAnalysis }}</p>
        </ReportCard>

        <!-- 运势洞察 -->
        <ReportCard title="运势洞察" icon="🌟" :delay="200">
          <p class="text-gray-600 leading-relaxed" style="font-size: 15px;">{{ report.destinyInsight }}</p>
        </ReportCard>

        <!-- 人际关系匹配 -->
        <ReportCard title="人际关系匹配" icon="💞" :delay="250">
          <p class="text-gray-600 leading-relaxed" style="font-size: 15px;">{{ report.relationships }}</p>
        </ReportCard>

        <!-- 四维度 -->
        <ReportCard title="四维度解析" icon="📊" :delay="300">
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
        <ReportCard title="认知功能栈" icon="🧬" :delay="350">
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
        <ReportCard title="你的超能力" icon="💪" :delay="400">
          <ul class="space-y-3">
            <li v-for="(s, i) in report.strengths" :key="i" class="flex items-start gap-3">
              <span class="text-green-500 mt-0.5 shrink-0 text-lg">✦</span>
              <span class="text-base text-gray-700 leading-relaxed">{{ s }}</span>
            </li>
          </ul>
        </ReportCard>

        <!-- 成长空间 -->
        <ReportCard title="成长空间" icon="🌱" :delay="450">
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
          <p class="text-sm text-gray-400 mt-4 italic">命理与人格，是认识自己的两面镜子。</p>
        </ReportCard>

        </template>
        <!-- /已付费内容结束 -->

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
            @click="goConsult"
            class="w-full bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all"
            style="padding: 20px 0; font-size: 18px;"
          >
            AI 个性化咨询 →
          </button>
          <button
            @click="retest"
            class="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors"
            style="padding: 20px 0; font-size: 18px;"
          >
            重新测试
          </button>
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
const shareText = ref('分享结果')
const hasPaid = ref(false)

// 检查是否已付费（简单本地存储方案）
function checkPaid() {
  const paidKey = 'mystical_paid_' + (report.value?.type || '')
  hasPaid.value = localStorage.getItem(paidKey) === 'true'
}

function confirmPaid() {
  const paidKey = 'mystical_paid_' + (report.value?.type || '')
  localStorage.setItem(paidKey, 'true')
  hasPaid.value = true
}

const letterColors = [
  'text-purple-600', 'text-indigo-500', 'text-violet-500', 'text-fuchsia-500'
]
function letterColor(i) { return letterColors[i] || 'text-purple-600' }

// 八字四柱
const baziPillars = computed(() => {
  const bazi = report.value?.bazi
  if (!bazi) return []
  return [
    { label: '年柱', top: bazi.yearPillar?.[0] || '', bottom: bazi.yearPillar?.[1] || '' },
    { label: '月柱', top: bazi.monthPillar?.[0] || '', bottom: bazi.monthPillar?.[1] || '' },
    { label: '日柱', top: bazi.dayPillar?.[0] || '', bottom: bazi.dayPillar?.[1] || '' },
    { label: '时柱', top: bazi.hourPillar?.[0] || '', bottom: bazi.hourPillar?.[1] || '' },
  ]
})

// 五行条形图
const wuxingBars = computed(() => {
  const w = report.value?.wuxing
  if (!w) return []
  return [
    { name: '金', value: w.metal || 0, color: '#D4A017' },
    { name: '木', value: w.wood || 0, color: '#2E8B57' },
    { name: '水', value: w.water || 0, color: '#4682B4' },
    { name: '火', value: w.fire || 0, color: '#DC3545' },
    { name: '土', value: w.earth || 0, color: '#8B6914' },
  ]
})

// 四维度
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

// 认知功能栈
const cognitiveLabels = ['主导功能', '辅助功能', '第三功能', '劣势功能']
const cognitiveColors = ['bg-purple-100', 'bg-indigo-50', 'bg-violet-50', 'bg-gray-50']
const cognitiveList = computed(() => {
  const s = report.value?.cognitiveStack
  if (!s) return []
  return [s.dominant, s.auxiliary, s.tertiary, s.inferior]
})

function shareResult() {
  const text = `我的 MBTI 是 ${report.value.type} — ${report.value.headline}\n命理分析显示五行偏向：${report.value.wuxing?.analysis?.slice(0, 30)}...\n快来测测你的：${window.location.origin}${window.location.pathname}`
  if (navigator.share) {
    navigator.share({ title: '我的 MBTI × 命理报告', text, url: window.location.href }).catch(() => {})
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

function goConsult() {
  router.push('/consult')
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
  } catch (e) {
    console.error('解析报告失败:', e)
  }
  if (!report.value) router.push('/')
  else checkPaid()
})
</script>
