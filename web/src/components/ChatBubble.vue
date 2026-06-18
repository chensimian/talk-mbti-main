<template>
  <div
    class="flex items-start"
    :class="isUser ? 'flex-row-reverse' : ''"
    style="gap: 16px; padding: 16px 0;"
  >
    <!-- 头像 -->
    <div
      class="shrink-0 rounded-full flex items-center justify-center"
      :class="isUser ? 'bg-blue-100' : 'bg-purple-100'"
      style="width: 44px; height: 44px; font-size: 20px;"
    >
      {{ isUser ? '🧑' : '🔮' }}
    </div>

    <!-- 消息气泡 -->
    <div
      class="rounded-2xl break-words leading-relaxed"
      style="max-width: 78%; padding: 16px 20px; font-size: 16px;"
      :class="isUser
        ? 'bg-blue-50 text-gray-800 rounded-tr-sm'
        : 'bg-gray-50 text-gray-800 rounded-tl-sm'"
    >
      <!-- 用户消息：纯文本 -->
      <template v-if="isUser">{{ message.content }}</template>

      <!-- AI 消息：渲染 Markdown -->
      <div v-else class="markdown-body" v-html="renderedContent"></div>

      <span
        v-if="isStreaming && !isUser"
        class="inline-block bg-gray-400 align-middle animate-blink"
        style="width: 2px; height: 20px; margin-left: 2px;"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

// 配置 marked：不要生成多余的 <p> 标签包裹短文本
marked.setOptions({
  breaks: true,   // 换行符转 <br>
  gfm: true,      // GitHub Flavored Markdown
})

const props = defineProps({
  message: { type: Object, required: true },
  isStreaming: { type: Boolean, default: false },
})

const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  if (isUser.value) return ''
  return marked.parse(props.message.content || '')
})
</script>

<style>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink { animation: blink 0.8s step-end infinite; }

/* Markdown 渲染样式 */
.markdown-body {
  line-height: 1.7;
}
.markdown-body p {
  margin: 0 0 8px 0;
}
.markdown-body p:last-child {
  margin-bottom: 0;
}
.markdown-body strong {
  font-weight: 700;
  color: #374151;
}
.markdown-body em {
  font-style: italic;
}
.markdown-body ul, .markdown-body ol {
  margin: 8px 0;
  padding-left: 20px;
}
.markdown-body li {
  margin: 4px 0;
}
.markdown-body li::marker {
  color: #9ca3af;
}
.markdown-body code {
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}
.markdown-body blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 12px;
  margin: 8px 0;
  color: #6b7280;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  font-weight: 700;
  margin: 12px 0 6px 0;
}
.markdown-body h1 { font-size: 1.2em; }
.markdown-body h2 { font-size: 1.1em; }
.markdown-body h3 { font-size: 1.05em; }
.markdown-body hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 12px 0;
}
</style>
