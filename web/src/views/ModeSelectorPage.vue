<template>
  <div
    style="
      min-height: 100vh;
      background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      padding-top: 60px;
    "
  >
    <!-- 标题 -->
    <div style="text-align: center; margin-bottom: 36px;">
      <h1 style="font-size: 28px; font-weight: 800; color: #fff; margin: 0 0 8px;">
        选择测试模式
      </h1>
      <p style="font-size: 15px; color: rgba(255, 255, 255, 0.7); margin: 0;">
        选一个适合你的方式开始探索
      </p>
    </div>

    <!-- 模式卡片列表 -->
    <div style="width: 100%; max-width: min(460px, 100%); display: flex; flex-direction: column; gap: 16px;">

      <!-- 标准版 -->
      <div class="mode-card" @click="goTo('/tags')">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 40px; line-height: 1;">🔮</span>
          <div style="flex: 1;">
            <h2 style="font-size: 18px; font-weight: 700; color: #2d3436; margin: 0 0 4px;">MBTI 人格测试</h2>
            <p style="font-size: 13px; color: #636e72; margin: 0; line-height: 1.4;">通过自然对话分析你的人格类型</p>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

      <!-- 学生版 -->
      <div class="mode-card" @click="requireLoginThen('/tags?mode=student')">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 40px; line-height: 1;">🎓</span>
          <div style="flex: 1;">
            <h2 style="font-size: 18px; font-weight: 700; color: #2d3436; margin: 0 0 4px;">学生专业推荐</h2>
            <p style="font-size: 13px; color: #636e72; margin: 0; line-height: 1.4;">分析人格类型 + 推荐匹配专业</p>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

      <!-- MBTI 答疑 -->
      <div class="mode-card" @click="requireLoginThen('/consult')">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 40px; line-height: 1;">💬</span>
          <div style="flex: 1;">
            <h2 style="font-size: 18px; font-weight: 700; color: #2d3436; margin: 0 0 4px;">MBTI 答疑</h2>
            <p style="font-size: 13px; color: #636e72; margin: 0 0 8px; line-height: 1.4;">输入你的 MBTI 和问题，获取个性化建议</p>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

      <!-- 玄学版 -->
      <div class="mode-card" @click="requireLoginThen('/birth-info')">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <span style="font-size: 40px; line-height: 1;">🌙</span>
          <div style="flex: 1;">
            <h2 style="font-size: 18px; font-weight: 700; color: #2d3436; margin: 0 0 4px;">八字 × MBTI 命理</h2>
            <p style="font-size: 13px; color: #636e72; margin: 0 0 8px; line-height: 1.4;">结合出生八字和人格分析的综合报告</p>
          </div>
          <span style="color: #b2bec3; font-size: 20px; align-self: center;">›</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthGlobal } from '../composables/useAuth'

const router = useRouter()
const auth = useAuthGlobal()

function goTo(path) {
  router.push(path)
}

// 高级功能需要登录
function requireLoginThen(path) {
  if (auth.isGuest.value) {
    // 记住要去的页面，登录后跳转
    sessionStorage.setItem('redirect_after_login', path)
    router.push('/login')
  } else {
    router.push(path)
  }
}
</script>

<style scoped>
.mode-card {
  background: #fff;
  border-radius: 16px;
  padding: clamp(18px, 4vw, 24px) clamp(16px, 3.5vw, 20px);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}
.mode-card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 24px rgba(108, 92, 231, 0.18);
}
.mode-card:active {
  transform: scale(0.98);
}
.tag-free {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
  font-weight: 600;
}
.tag-paid {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f3f0ff;
  color: #6C5CE7;
  font-size: 11px;
  font-weight: 600;
}
</style>
