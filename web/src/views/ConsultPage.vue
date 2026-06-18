<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center" style="padding: clamp(8px, 2vw, 20px);">
    <div class="w-full bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden" style="max-width: min(580px, 100%); height: 92vh;">

      <!-- 顶部栏 -->
      <header class="shrink-0 flex items-center justify-between border-b border-gray-100" style="padding: 16px 24px;">
        <button
          @click="$router.back()"
          class="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors rounded-lg hover:bg-gray-50"
          style="padding: 10px 16px; font-size: 14px;"
        >
          ← 返回
        </button>
        <span class="text-purple-600 font-semibold" style="font-size: 16px;">AI 个性化咨询</span>
        <span v-if="chatStarted" class="text-gray-400" style="font-size: 13px;">
          剩余 {{ maxRounds - currentRound }} 轮
        </span>
        <span v-else></span>
      </header>

      <!-- 未开始：问题输入界面 -->
      <div v-if="!chatStarted" class="flex-1 overflow-y-auto" style="padding: clamp(12px, 3vw, 28px) clamp(12px, 3vw, 24px);">

        <!-- MBTI 类型输入/展示 -->
        <div class="text-center" style="margin-bottom: 28px;">
          <p class="text-gray-400" style="font-size: 13px; margin-bottom: 12px;">你的 MBTI 类型</p>
          <div v-if="mbtiType && !editingType" class="flex items-center justify-center" style="gap: 12px;">
            <div
              class="bg-purple-100 text-purple-700 font-black rounded-xl text-center"
              style="padding: 14px 28px; font-size: 32px; letter-spacing: 6px;"
            >
              {{ mbtiType }}
            </div>
            <button @click="editingType = true" class="text-gray-400 hover:text-purple-600 cursor-pointer" style="font-size: 13px;">修改</button>
          </div>
          <div v-else style="max-width: 280px; margin: 0 auto;">
            <input
              v-model="mbtiInput"
              type="text"
              maxlength="4"
              placeholder="输入 4 位 MBTI，如 INTJ"
              class="w-full rounded-xl border-2 border-purple-200 text-center font-black text-purple-700 uppercase focus:outline-none focus:border-purple-500 transition-all"
              style="padding: 14px; font-size: 28px; letter-spacing: 6px;"
              @input="mbtiInput = mbtiInput.toUpperCase()"
            />
            <button
              v-if="isValidMbti"
              @click="confirmType"
              class="w-full bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 cursor-pointer transition-all"
              style="padding: 12px 0; font-size: 15px; margin-top: 12px;"
            >
              确认
            </button>
            <p v-else class="text-gray-400" style="font-size: 12px; margin-top: 8px;">
              合法类型：INTJ、ENFP、ISTP 等 16 种
            </p>
          </div>
        </div>

        <p class="text-gray-500 text-center" style="font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
          基于你的 <strong class="text-purple-600">{{ mbtiType || 'MBTI' }}</strong> 人格特质，AI 会给出针对性的建议。<br/>
          职场、人际、成长……什么都可以聊。
        </p>

        <!-- 问题输入 -->
        <textarea
          v-model="question"
          rows="5"
          placeholder="描述你遇到的问题，比如：我和同事总是沟通不畅..."
          class="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 leading-relaxed focus:outline-none focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-50 transition-all"
          style="padding: 20px; font-size: 16px;"
        />

        <!-- 快捷问题建议 -->
        <div class="flex flex-wrap" style="gap: 8px; margin-top: 16px;">
          <button
            v-for="(q, i) in quickQuestions"
            :key="i"
            @click="question = q"
            class="bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
            style="padding: 8px 16px; font-size: 13px;"
          >
            {{ q }}
          </button>
        </div>

        <!-- 开始咨询按钮 -->
        <button
          @click="startConsult"
          :disabled="!question.trim() || !mbtiType"
          class="w-full bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style="padding: 20px 0; font-size: 18px; margin-top: 28px;"
        >
          开始咨询 →
        </button>
      </div>

      <!-- 已开始：对话界面 -->
      <template v-else>
        <!-- 消息区域 -->
        <main
          ref="messageContainer"
          class="flex-1 overflow-y-auto"
          style="padding: clamp(12px, 3vw, 28px) clamp(12px, 3vw, 24px);"
        >
          <ChatBubble
            v-for="(msg, idx) in messages"
            :key="idx"
            :message="msg"
            :isStreaming="idx === messages.length - 1 && msg.role === 'assistant' && loading"
          />
          <TypingIndicator
            v-if="loading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !streamingText)"
          />

          <!-- 轮次用尽提示 -->
          <div
            v-if="currentRound >= maxRounds"
            class="bg-purple-50 border border-purple-200 rounded-2xl text-center"
            style="padding: 24px; margin-top: 16px;"
          >
            <p class="text-purple-600 font-semibold" style="font-size: 15px;">本次咨询已结束 ✨</p>
            <p class="text-gray-400" style="font-size: 13px; margin-top: 8px;">希望这次对话对你有帮助</p>
          </div>
        </main>

        <!-- 底部输入栏 -->
        <footer class="shrink-0 border-t border-gray-100" style="padding: clamp(12px, 3vw, 20px) clamp(12px, 3vw, 24px);">
          <div v-if="error" class="text-red-400" style="font-size: 14px; margin-bottom: 12px;">{{ error }}</div>
          <div class="flex items-end" style="gap: 16px;">
            <textarea
              ref="inputRef"
              v-model="inputText"
              :disabled="loading || currentRound >= maxRounds"
              @keydown="handleKeydown"
              rows="3"
              :placeholder="loading ? '对方正在输入...' : '继续提问...'"
              class="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 leading-relaxed overflow-y-auto focus:outline-none focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-50 disabled:opacity-40 transition-all"
              style="padding: 16px 20px; font-size: 16px; max-height: 160px;"
            />
            <button
              @click="handleSend"
              :disabled="loading || currentRound >= maxRounds || !inputText.trim()"
              class="shrink-0 rounded-xl bg-purple-600 text-white flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 transition-all"
              style="width: 48px; height: 48px; font-size: 18px; margin-bottom: 4px;"
            >
              ↵
            </button>
          </div>
        </footer>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGemini } from '../composables/useGemini'
import { buildConsultPrompt } from '../prompts/consult'
import { useAuthGlobal } from '../composables/useAuth'
import { supabase } from '../lib/supabase'
import ChatBubble from '../components/ChatBubble.vue'
import TypingIndicator from '../components/TypingIndicator.vue'

const router = useRouter()

// --- 状态 ---
const mbtiType = ref('')
const mbtiInput = ref('')
const editingType = ref(false)
const cognitiveStack = ref(null)
const question = ref('')
const chatStarted = ref(false)
const messages = ref([])
const inputText = ref('')
const currentRound = ref(0)
const maxRounds = 20

const messageContainer = ref(null)
const inputRef = ref(null)

const { loading, error, streamingText, init, sendMessageStream } = useGemini()

const VALID_TYPES = [
  'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'
]
const isValidMbti = computed(() => VALID_TYPES.includes(mbtiInput.value.toUpperCase()))

function confirmType() {
  mbtiType.value = mbtiInput.value.toUpperCase()
  editingType.value = false
}

const quickQuestions = [
  '和领导意见不合怎么办？',
  '总是拖延怎么破？',
  '不知道自己适合什么工作',
  '和伴侣性格差异很大',
]

// TODO: 检查付费状态

// --- 初始化：尝试从 sessionStorage 或 Supabase 读取已有 MBTI ---
onMounted(async () => {
  // 优先从最近的报告中读取
  try {
    const raw = sessionStorage.getItem('mbti_report')
    if (raw) {
      const report = JSON.parse(raw)
      mbtiType.value = report.type || ''
      mbtiInput.value = report.type || ''
      cognitiveStack.value = report.cognitiveStack || null
    }
  } catch (e) {
    console.warn('解析报告失败:', e)
  }

  // 如果没有报告，尝试从 Supabase 读最近一条
  if (!mbtiType.value && supabase) {
    try {
      const auth = useAuthGlobal()
      // 访客用户不查数据库
      if (!auth.isGuest.value) {
        const userId = auth.getEffectiveUserId()
        const { data } = await supabase
          .from('mbti_results')
          .select('mbti_type, cognitive_stack')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (data) {
          mbtiType.value = data.mbti_type
          mbtiInput.value = data.mbti_type
          cognitiveStack.value = data.cognitive_stack
        }
      }
    } catch (e) {
      // 没有历史记录，显示输入框
    }
  }

  // 如果还是没有，显示手动输入
  if (!mbtiType.value) {
    editingType.value = true
  }
})

// --- 开始咨询 ---
function startConsult() {
  if (!question.value.trim()) return

  const systemPrompt = buildConsultPrompt(
    mbtiType.value,
    cognitiveStack.value,
    question.value.trim()
  )
  init(systemPrompt)
  chatStarted.value = true

  // 发送第一条消息
  messages.value.push({ role: 'user', content: question.value.trim() })
  currentRound.value++
  doSend(question.value.trim())
}

// --- 发送消息 ---
async function doSend(text) {
  try {
    await sendMessageStream(text, (chunk) => {
      const last = messages.value[messages.value.length - 1]
      if (last && last.role === 'assistant') {
        last.content = chunk
      } else {
        messages.value.push({ role: 'assistant', content: chunk })
      }
    })
  } catch (e) {
    console.error('发送失败:', e)
  }
  focusInput()
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value || currentRound.value >= maxRounds) return
  inputText.value = ''
  messages.value.push({ role: 'user', content: text })
  currentRound.value++
  await doSend(text)
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// --- 辅助 ---
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

function focusInput() {
  nextTick(() => {
    if (inputRef.value && !loading.value && currentRound.value < maxRounds) {
      inputRef.value.focus()
    }
  })
}

watch([messages, streamingText], scrollToBottom, { deep: true })
watch(loading, (val) => { if (!val) focusInput() })
</script>
