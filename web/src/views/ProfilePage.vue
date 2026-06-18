<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航 -->
    <div class="bg-white shadow-sm sticky top-0 z-20">
      <div class="mx-auto flex items-center" style="max-width: min(580px, 100%); padding: 16px 20px;">
        <button
          @click="$router.back()"
          class="text-gray-600 hover:text-[#6C5CE7] transition-colors"
          style="font-size: 24px; margin-right: 16px;"
        >
          ←
        </button>
        <h1 class="font-bold text-gray-800" style="font-size: 18px;">个人中心</h1>
      </div>
    </div>

    <div class="mx-auto" style="max-width: min(580px, 100%); padding: 20px;">
      <!-- 用户信息卡片 -->
      <div class="bg-white rounded-2xl shadow-lg" style="padding: 32px 24px; margin-bottom: 16px;">
        <div class="flex items-center" style="gap: 16px;">
          <!-- 头像 -->
          <div
            class="rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0"
            style="width: 64px; height: 64px; font-size: 32px;"
          >
            {{ auth.avatarUrl.value ? '' : '🧑' }}
            <img
              v-if="auth.avatarUrl.value"
              :src="auth.avatarUrl.value"
              class="w-full h-full rounded-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center" style="gap: 10px; margin-bottom: 6px;">
              <span class="font-bold text-gray-800 truncate" style="font-size: 20px;">
                {{ auth.displayName.value }}
              </span>
              <span
                class="flex-shrink-0 rounded-full font-medium"
                :class="auth.isLoggedIn.value ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
                style="padding: 3px 10px; font-size: 12px;"
              >
                {{ auth.isLoggedIn.value ? '已登录' : '访客' }}
              </span>
            </div>
            <p class="text-gray-400 truncate" style="font-size: 14px;">
              {{ auth.isLoggedIn.value ? auth.user.value?.email : 'ID: ' + auth.guestId.value?.slice(0, 8) + '...' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 访客提示条 -->
      <div
        v-if="auth.isGuest.value"
        @click="$router.push('/login')"
        class="bg-purple-50 rounded-2xl flex items-center cursor-pointer hover:bg-purple-100 transition-colors"
        style="padding: 16px 20px; margin-bottom: 16px; gap: 12px;"
      >
        <span style="font-size: 20px;">💡</span>
        <span class="text-[#6C5CE7] font-medium" style="font-size: 14px;">登录以同步数据，测试记录不会丢失</span>
        <span class="ml-auto text-[#6C5CE7]" style="font-size: 16px;">→</span>
      </div>

      <!-- 功能列表 -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden" style="margin-bottom: 16px;">
        <button
          @click="$router.push('/history')"
          class="w-full flex items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          style="padding: 18px 24px; border-bottom: 1px solid #f3f4f6;"
        >
          <span style="font-size: 22px; margin-right: 14px;">📋</span>
          <span class="text-gray-700 font-medium" style="font-size: 16px;">测试历史</span>
          <span class="ml-auto text-gray-400" style="font-size: 18px;">›</span>
        </button>
        <button
          @click="$router.push('/tags')"
          class="w-full flex items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          style="padding: 18px 24px; border-bottom: 1px solid #f3f4f6;"
        >
          <span style="font-size: 22px; margin-right: 14px;">🔮</span>
          <span class="text-gray-700 font-medium" style="font-size: 16px;">重新测试</span>
          <span class="ml-auto text-gray-400" style="font-size: 18px;">›</span>
        </button>
        <a
          href="privacy.html"
          target="_blank"
          class="w-full flex items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          style="padding: 18px 24px; border-bottom: 1px solid #f3f4f6; text-decoration: none;"
        >
          <span style="font-size: 22px; margin-right: 14px;">📖</span>
          <span class="text-gray-700 font-medium" style="font-size: 16px;">隐私政策</span>
          <span class="ml-auto text-gray-400" style="font-size: 18px;">›</span>
        </a>
        <button
          v-if="auth.isLoggedIn.value"
          @click="handleSignOut"
          class="w-full flex items-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
          style="padding: 18px 24px;"
        >
          <span style="font-size: 22px; margin-right: 14px;">🚪</span>
          <span class="text-red-500 font-medium" style="font-size: 16px;">退出登录</span>
        </button>
      </div>

      <!-- 版本号 -->
      <p class="text-center text-gray-400" style="font-size: 13px; margin-top: 40px;">
        v1.0.0
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthGlobal } from '../composables/useAuth'

const router = useRouter()
const auth = useAuthGlobal()

async function handleSignOut() {
  await auth.signOut()
  router.push('/')
}
</script>
