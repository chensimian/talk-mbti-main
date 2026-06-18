import { ref } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 优先走 Worker 代理（隐藏 API Key + 国内可用），回退直连
const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL // e.g. https://gemini-proxy.xxx.workers.dev
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

/**
 * Gemini API 封装 composable
 * 支持流式输出和多轮对话
 * 当配置了 PROXY_URL 时，走 Cloudflare Worker 代理（API Key 藏在 Worker 里）
 * 否则回退到直连 Google（API Key 暴露在前端）
 */
export function useGemini() {
  const loading = ref(false)
  const error = ref(null)
  const streamingText = ref('')

  let genAI = null
  let chatSession = null

  function init(systemPrompt) {
    const options = {}

    if (PROXY_URL) {
      // 走代理：用占位 key（Worker 会注入真实 key），设置自定义 base URL
      genAI = new GoogleGenerativeAI('PROXY')
      // @google/generative-ai SDK 的 baseUrl 通过 requestOptions 传递
      options.baseUrl = PROXY_URL
    } else {
      // 回退直连
      genAI = new GoogleGenerativeAI(API_KEY)
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.75,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }, options)
    chatSession = model.startChat({ history: [] })
  }

  async function sendMessageStream(message, onChunk) {
    if (!chatSession) throw new Error('请先调用 init() 初始化')
    loading.value = true
    error.value = null
    streamingText.value = ''

    try {
      const result = await chatSession.sendMessageStream(message)
      let fullText = ''
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullText += text
        streamingText.value = fullText
        if (onChunk) onChunk(fullText)
      }
      loading.value = false
      return fullText
    } catch (e) {
      error.value = e.message || '请求失败，请检查网络连接'
      loading.value = false
      throw e
    }
  }

  async function generateStream(prompt, onChunk) {
    if (!genAI) throw new Error('请先调用 init() 初始化')
    loading.value = true
    error.value = null
    streamingText.value = ''

    try {
      const options = PROXY_URL ? { baseUrl: PROXY_URL } : {}
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }, options)
      const result = await model.generateContentStream(prompt)
      let fullText = ''
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullText += text
        streamingText.value = fullText
        if (onChunk) onChunk(fullText)
      }
      loading.value = false
      return fullText
    } catch (e) {
      error.value = e.message || '请求失败，请检查网络连接'
      loading.value = false
      throw e
    }
  }

  return {
    loading,
    error,
    streamingText,
    init,
    sendMessageStream,
    generateStream,
  }
}
