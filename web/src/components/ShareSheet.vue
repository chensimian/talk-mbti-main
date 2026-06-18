<template>
  <teleport to="body">
    <transition name="share-overlay">
      <div
        v-if="visible"
        class="fixed inset-0 flex items-end justify-center"
        style="z-index: 9999;"
        @click.self="$emit('close')"
      >
        <!-- 遮罩 -->
        <div
          class="absolute inset-0"
          style="background: rgba(0, 0, 0, 0.5);"
          @click="$emit('close')"
        ></div>

        <!-- 底部面板 -->
        <transition name="share-panel">
          <div
            v-if="visible"
            class="relative w-full"
            style="max-width: 580px; z-index: 1;"
          >
            <div
              style="
                background: #fff;
                border-radius: 20px 20px 0 0;
                padding: 28px 24px env(safe-area-inset-bottom, 20px);
              "
            >
              <!-- 标题 -->
              <div style="text-align: center; margin-bottom: 24px;">
                <h3 style="font-size: 18px; font-weight: 700; color: #2d3436; margin: 0 0 6px;">
                  分享给好友
                </h3>
                <p style="font-size: 13px; color: #b2bec3; margin: 0;">
                  {{ title }}
                </p>
              </div>

              <!-- 分享选项网格 2x2 -->
              <div
                style="
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 16px;
                  margin-bottom: 24px;
                "
              >
                <button
                  v-for="item in shareOptions"
                  :key="item.key"
                  @click="handleShare(item.key)"
                  style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 12px;
                    border-radius: 16px;
                    border: 2px solid #f0ecfc;
                    background: #faf9fe;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  "
                  @mousedown="$event.currentTarget.style.transform = 'scale(0.95)'"
                  @mouseup="$event.currentTarget.style.transform = 'scale(1)'"
                  @mouseleave="$event.currentTarget.style.transform = 'scale(1)'"
                >
                  <span style="font-size: 32px; margin-bottom: 8px;">{{ item.icon }}</span>
                  <span style="font-size: 14px; color: #2d3436; font-weight: 500;">{{ item.label }}</span>
                </button>
              </div>

              <!-- 取消按钮 -->
              <button
                @click="$emit('close')"
                style="
                  width: 100%;
                  padding: 16px;
                  border-radius: 14px;
                  border: none;
                  background: #f5f5f5;
                  font-size: 16px;
                  font-weight: 600;
                  color: #636e72;
                  cursor: pointer;
                  transition: background 0.2s;
                "
                @mouseenter="$event.currentTarget.style.background = '#ebebeb'"
                @mouseleave="$event.currentTarget.style.background = '#f5f5f5'"
              >
                取消
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
})

const emit = defineEmits(['close', 'shared'])

const shareOptions = [
  { key: 'copy', icon: '📋', label: '复制链接' },
  { key: 'wechat', icon: '💬', label: '微信' },
  { key: 'qq', icon: '📱', label: 'QQ' },
  { key: 'image', icon: '📷', label: '保存图片' },
]

const toast = ref('')

async function handleShare(key) {
  const shareUrl = props.url || window.location.href

  if (key === 'copy') {
    await copyLink(shareUrl)
    return
  }

  if (key === 'wechat' || key === 'qq') {
    await webShare(shareUrl)
    return
  }

  if (key === 'image') {
    // TODO: 后续实现 canvas 截图保存
    alert('保存图片功能即将上线，敬请期待！')
    return
  }
}

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url)
    emit('shared')
    emit('close')
  } catch {
    // fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    emit('shared')
    emit('close')
  }
}

async function webShare(url) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.title,
        text: props.description,
        url: url,
      })
      emit('shared')
      emit('close')
    } catch (e) {
      // 用户取消分享，不处理
      if (e.name !== 'AbortError') {
        await copyLink(url)
      }
    }
  } else {
    // 不支持 Web Share API，fallback 到复制链接
    await copyLink(url)
  }
}
</script>

<style>
/* 遮罩淡入淡出 */
.share-overlay-enter-active,
.share-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.share-overlay-enter-from,
.share-overlay-leave-to {
  opacity: 0;
}

/* 面板从底部滑入 */
.share-panel-enter-active {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.share-panel-leave-active {
  transition: transform 0.25s cubic-bezier(0.55, 0, 1, 0.45);
}
.share-panel-enter-from,
.share-panel-leave-to {
  transform: translateY(100%);
}
</style>
