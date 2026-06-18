import { ref, computed } from 'vue'
import { useGemini } from './useGemini'
import { buildChatSystemPrompt, buildReportPrompt } from '../prompts/system'
import { buildStudentChatPrompt, buildStudentReportPrompt } from '../prompts/student'
import { buildMysticalChatPrompt, buildMysticalReportPrompt } from '../prompts/mystical'
import { END_KEYWORDS } from '../constants/tags'
import { saveResult, saveDraft, loadDraft } from '../lib/supabase'

const DRAFT_INTERVAL = 5 // 每 5 轮保存一次草稿

export function useChat() {
  const messages = ref([])
  const userTags = ref({})
  const currentRound = ref(0)
  const maxRounds = ref(30)
  const isFinished = ref(false)
  const isGeneratingReport = ref(false)
  const report = ref(null)
  const canSkip = computed(() => currentRound.value >= 10)
  const sessionId = ref(null) // 会话 ID，用于草稿保存
  const hasDraft = ref(false) // 是否有未完成的草稿
  const chatMode = ref('standard') // standard | student | mystical
  const gemini = useGemini()

  const progress = computed(() => Math.min((currentRound.value / maxRounds.value) * 100, 100))

  function initChat(tags, rounds = 30, mode = 'standard') {
    userTags.value = tags
    messages.value = []
    currentRound.value = 0
    maxRounds.value = rounds
    isFinished.value = false
    report.value = null
    sessionId.value = crypto.randomUUID()
    chatMode.value = mode

    let systemPrompt
    if (mode === 'student') {
      systemPrompt = buildStudentChatPrompt(tags, rounds)
    } else if (mode === 'mystical') {
      const birthInfo = JSON.parse(sessionStorage.getItem('mbti_birth_info') || '{}')
      systemPrompt = buildMysticalChatPrompt(tags, birthInfo, rounds)
    } else {
      systemPrompt = buildChatSystemPrompt(tags, rounds)
    }

    gemini.init(systemPrompt)
  }

  /**
   * 检查是否有未完成的草稿
   */
  async function checkDraft() {
    const draft = await loadDraft()
    if (draft && draft.messages && draft.messages.length > 0) {
      hasDraft.value = true
      return draft
    }
    hasDraft.value = false
    return null
  }

  /**
   * 从草稿恢复对话
   */
  function restoreFromDraft(draft) {
    sessionId.value = draft.id
    messages.value = draft.messages || []
    currentRound.value = draft.round_count || 0
    userTags.value = draft.user_tags || {}

    const systemPrompt = buildChatSystemPrompt(userTags.value, maxRounds.value)
    gemini.init(systemPrompt)
    // 注意：恢复后 Gemini 的对话历史丢失了，但 system prompt 还在
    // AI 会根据 messages 中的上下文继续对话
  }

  function isEndCommand(text) {
    const trimmed = text.trim().toLowerCase()
    return END_KEYWORDS.some(kw => trimmed.includes(kw.toLowerCase()))
  }

  /**
   * 每 5 轮自动保存草稿
   */
  function maybeSaveDraft() {
    if (currentRound.value > 0 && currentRound.value % DRAFT_INTERVAL === 0) {
      saveDraft(sessionId.value, messages.value, userTags.value, currentRound.value)
        .catch(e => console.warn('[Supabase] 草稿保存失败:', e))
    }
  }

  async function sendMessage(text, onChunk) {
    messages.value.push({ role: 'user', content: text })
    currentRound.value++

    if (isEndCommand(text)) {
      return await generateReport()
    }

    if (currentRound.value >= maxRounds.value) {
      await gemini.sendMessageStream(text, onChunk)
      return await generateReport()
    }

    const reply = await gemini.sendMessageStream(text, onChunk)

    // 每 5 轮自动保存草稿
    maybeSaveDraft()

    return reply
  }

  async function getGreeting(onChunk) {
    const greeting = await gemini.sendMessageStream(
      '[系统指令：请根据用户的标签信息，发出第一句打招呼的话，自然开启对话。不要暴露你在做分析。]',
      onChunk
    )
    return greeting
  }

  async function generateReport() {
    isFinished.value = true
    isGeneratingReport.value = true

    try {
      let prompt
      if (chatMode.value === 'student') {
        prompt = buildStudentReportPrompt(userTags.value, messages.value)
      } else if (chatMode.value === 'mystical') {
        const birthInfo = JSON.parse(sessionStorage.getItem('mbti_birth_info') || '{}')
        prompt = buildMysticalReportPrompt(userTags.value, messages.value, birthInfo)
      } else {
        prompt = buildReportPrompt(userTags.value, messages.value)
      }

      const rawText = await gemini.generateStream(prompt)

      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        report.value = JSON.parse(jsonStr)
      } else {
        throw new Error('无法解析报告 JSON')
      }
    } catch (e) {
      console.error('报告生成失败:', e)
      try {
        let retryPrompt
        if (chatMode.value === 'student') {
          retryPrompt = buildStudentReportPrompt(userTags.value, messages.value)
        } else if (chatMode.value === 'mystical') {
          const birthInfo = JSON.parse(sessionStorage.getItem('mbti_birth_info') || '{}')
          retryPrompt = buildMysticalReportPrompt(userTags.value, messages.value, birthInfo)
        } else {
          retryPrompt = buildReportPrompt(userTags.value, messages.value)
        }
        const rawText = await gemini.generateStream(retryPrompt)
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          report.value = JSON.parse(jsonStr)
        }
      } catch (e2) {
        console.error('报告重试也失败:', e2)
      }
    } finally {
      isGeneratingReport.value = false
    }

    // 保存最终报告 + 标记会话完成
    if (report.value) {
      saveResult(report.value, messages.value, userTags.value, currentRound.value, sessionId.value)
        .then(id => { if (id) console.log('[Supabase] 报告已保存, id:', id) })
        .catch(e => console.warn('[Supabase] 保存失败:', e))
    }

    return report.value
  }

  return {
    messages,
    userTags,
    currentRound,
    maxRounds,
    progress,
    isFinished,
    isGeneratingReport,
    canSkip,
    hasDraft,
    sessionId,
    report,
    loading: gemini.loading,
    error: gemini.error,
    streamingText: gemini.streamingText,
    initChat,
    sendMessage,
    getGreeting,
    generateReport,
    isEndCommand,
    checkDraft,
    restoreFromDraft,
  }
}
