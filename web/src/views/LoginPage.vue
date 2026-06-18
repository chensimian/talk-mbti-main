<template>
  <div class="min-h-screen bg-gradient-to-br from-[#6C5CE7] via-[#a29bfe] to-[#dfe6e9] flex flex-col items-center justify-center relative overflow-hidden" style="padding: 40px 20px;">
    <!-- 背景装饰 -->
    <div class="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    <div class="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />

    <div class="relative z-10 w-full" style="max-width: 420px;">
      <!-- Logo -->
      <div class="text-center" style="margin-bottom: 40px;">
        <div style="font-size: 56px; margin-bottom: 16px;">🔮</div>
        <h1 class="font-bold text-white" style="font-size: 28px;">读心术</h1>
      </div>

      <!-- 卡片 -->
      <div class="bg-white rounded-2xl shadow-xl" style="padding: clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px);">
        <!-- Tab 切换 -->
        <div class="flex rounded-xl bg-gray-100" style="padding: 4px; margin-bottom: 28px;">
          <button
            @click="activeTab = 'login'"
            class="flex-1 rounded-lg font-medium transition-all duration-200"
            :class="activeTab === 'login' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-gray-500'"
            style="padding: 10px 0; font-size: 15px;"
          >
            登录
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 rounded-lg font-medium transition-all duration-200"
            :class="activeTab === 'register' ? 'bg-white text-[#6C5CE7] shadow-sm' : 'text-gray-500'"
            style="padding: 10px 0; font-size: 15px;"
          >
            注册
          </button>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="auth.error.value"
          class="bg-red-50 text-red-600 rounded-xl"
          style="padding: 12px 16px; font-size: 14px; margin-bottom: 20px;"
        >
          {{ auth.error.value }}
        </div>

        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">邮箱</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="your@email.com"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 28px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <button
            type="submit"
            :disabled="auth.loading.value"
            class="w-full bg-[#6C5CE7] text-white font-bold rounded-xl hover:bg-[#5b4bd6] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style="padding: 16px 0; font-size: 16px;"
          >
            {{ auth.loading.value ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister">
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">昵称</label>
            <input
              v-model="registerForm.nickname"
              type="text"
              placeholder="你的昵称"
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="your@email.com"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <div style="margin-bottom: 28px;">
            <label class="block text-gray-600 font-medium" style="font-size: 14px; margin-bottom: 8px;">密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="至少 6 位密码"
              required
              class="w-full border border-gray-200 rounded-xl outline-none focus:border-[#6C5CE7] focus:ring-2 focus:ring-purple-100 transition-all"
              style="padding: clamp(12px, 3vw, 14px) clamp(12px, 3vw, 16px); font-size: 15px;"
            />
          </div>
          <button
            type="submit"
            :disabled="auth.loading.value"
            class="w-full bg-[#6C5CE7] text-white font-bold rounded-xl hover:bg-[#5b4bd6] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style="padding: 16px 0; font-size: 16px;"
          >
            {{ auth.loading.value ? '注册中...' : '注册' }}
          </button>
        </form>
      </div>

      <!-- Google 一键登录 -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.15);">
        <button
          @click="handleOAuthLogin('google')"
          class="w-full flex items-center justify-center rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer"
          style="padding: 16px 0; font-size: 16px; gap: 12px;"
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 33.2 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.9 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-4z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.9 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.5-1.8 13-4.7l-6-5.1C29.1 35.9 26.7 37 24 37c-5.2 0-9.6-3.5-11.1-8.2l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6 5.1c-.4.4 6.7-4.9 6.7-14.6 0-1.3-.2-2.7-.4-4z"/></svg>
          使用 Google 账号登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthGlobal } from '../composables/useAuth'
import { supabase } from '../lib/supabase'

const router = useRouter()
const auth = useAuthGlobal()

const activeTab = ref('login')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
})

function redirectAfterLogin() {
  const redirect = sessionStorage.getItem('redirect_after_login')
  if (redirect) {
    sessionStorage.removeItem('redirect_after_login')
    router.push(redirect)
  } else {
    router.push('/')
  }
}

async function handleLogin() {
  auth.error.value = null
  const success = await auth.signIn(loginForm.email, loginForm.password)
  if (success) {
    redirectAfterLogin()
  }
}

async function handleRegister() {
  auth.error.value = null
  const success = await auth.signUp(registerForm.email, registerForm.password, registerForm.nickname)
  if (success) {
    redirectAfterLogin()
  }
}

async function handleOAuthLogin(provider) {
  if (!supabase) return
  auth.error.value = null
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    })
    if (error) auth.error.value = error.message
  } catch (e) {
    auth.error.value = e.message
  }
}
</script>
