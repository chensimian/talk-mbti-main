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

        <button
          v-if="canSkip && !isFinished && !loading"
          @click="handleSkipToReport"
          class="bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 active:scale-95 transition-all cursor-pointer shadow-md animate-fade-in"
          style="padding: 10px 28px; font-size: 14px;"
        >
          结束对话，生成报告 →
        </button>
        <span v-else></span>
      </header>

      <!-- 进度条 -->
      <div class="shrink-0" style="height: 4px; background: #f5f5f5;">
        <div
          class="h-full transition-all duration-700 ease-out"
          style="background: #8b5cf6; border-radius: 0 4px 4px 0;"
          :style="{ width: progress + '%' }"
        ></div>
      </div>

      <!-- 消息区域 -->
      <main
        ref="messageContainer"
        class="flex-1 overflow-y-auto"
        style="padding: clamp(12px, 3vw, 28px) clamp(12px, 3vw, 24px);"
      >
        <div v-if="isGeneratingReport" class="flex flex-col items-center justify-center h-full" style="gap: 24px;">
          <div class="animate-spin-slow" style="font-size: 64px;">🔮</div>
          <p class="text-gray-400" style="font-size: 18px;">正在生成你的 MBTI 报告...</p>
        </div>

        <template v-else>
          <ChatBubble
            v-for="(msg, idx) in messages"
            :key="idx"
            :message="msg"
            :isStreaming="idx === messages.length - 1 && msg.role === 'assistant' && loading"
          />
          <TypingIndicator
            v-if="loading && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant' || !streamingText)"
          />
        </template>
      </main>

      <!-- 底部输入栏 -->
      <footer class="shrink-0 border-t border-gray-100" style="padding: clamp(12px, 3vw, 20px) clamp(12px, 3vw, 24px);">
        <div v-if="error" class="text-red-400" style="font-size: 14px; margin-bottom: 12px;">{{ error }}</div>

        <div class="flex items-end" style="gap: 16px;">
          <textarea
            ref="inputRef"
            v-model="inputText"
            :disabled="loading || isFinished"
            @keydown="handleKeydown"
            rows="3"
            :placeholder="loading ? '对方正在输入...' : '输入你的回复...'"
            class="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 leading-relaxed overflow-y-auto focus:outline-none focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-50 disabled:opacity-40 transition-all"
            style="padding: 16px 20px; font-size: 16px; max-height: 160px;"
          />
          <button
            @click="handleSend"
            :disabled="loading || isFinished || !inputText.trim()"
            class="shrink-0 rounded-xl bg-gray-900 text-white flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 transition-all"
            style="width: 48px; height: 48px; font-size: 18px; margin-bottom: 4px;"
          >
            ↵
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '../composables/useChat'
import ChatBubble from '../components/ChatBubble.vue'
import TypingIndicator from '../components/TypingIndicator.vue'

const router = useRouter()
const inputText = ref('')
const inputRef = ref(null)
const messageContainer = ref(null)
const chatMode = ref('standard') // standard | student | mystical

const {
  messages, currentRound, maxRounds, progress,
  isFinished, isGeneratingReport, canSkip,
  loading, streamingText, error,
  initChat, sendMessage, getGreeting, isEndCommand, generateReport, report,
} = useChat()

function scrollToBottom() {
  nextTick(() => { if (messageContainer.value) messageContainer.value.scrollTop = messageContainer.value.scrollHeight })
}
function focusInput() {
  nextTick(() => { if (inputRef.value && !loading.value && !isFinished.value) inputRef.value.focus() })
}

watch([messages, streamingText], scrollToBottom, { deep: true })
watch(loading, (val) => { if (!val) focusInput() })

watch(isFinished, (val) => {
  if (!val) return
  const unwatch = watch(isGeneratingReport, (generating) => {
    if (!generating && report.value) {
      sessionStorage.setItem('mbti_report', JSON.stringify(report.value))
      sessionStorage.setItem('mbti_messages', JSON.stringify(messages.value))
      unwatch()
      // 根据模式跳转不同报告页
      const reportRoutes = {
        student: '/student-report',
        mystical: '/mystical-report',
      }
      router.push(reportRoutes[chatMode.value] || '/report')
    }
  }, { immediate: true })
})

function onChunk(chunk) {
  const last = messages.value[messages.value.length - 1]
  if (last && last.role === 'assistant') last.content = chunk
  else messages.value.push({ role: 'assistant', content: chunk })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value || isFinished.value) return
  inputText.value = ''
  if (isEndCommand(text)) { messages.value.push({ role: 'user', content: text }); await generateReport(); return }
  await sendMessage(text, onChunk)
}

async function handleSkipToReport() { await generateReport() }
function handleKeydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

onMounted(async () => {
  const tagsStr = sessionStorage.getItem('mbti_tags')
  if (!tagsStr) { router.replace('/tags'); return }
  const tags = JSON.parse(tagsStr)
  chatMode.value = sessionStorage.getItem('mbti_mode') || 'standard'
  initChat(tags, 30, chatMode.value)
  await getGreeting(onChunk)
})
</script>

<style>
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin-slow { animation: spin-slow 2s linear infinite; }
@keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-fade-in { animation: fade-in 0.3s ease-out both; }
</style>
