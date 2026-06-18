<template>
  <div class="min-h-screen bg-gradient-to-br from-[#6C5CE7] via-[#a29bfe] to-[#dfe6e9] flex flex-col items-center justify-center relative overflow-hidden" style="padding: clamp(16px, 4vw, 40px);">
    <div class="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
    <div class="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delay" />

    <!-- 右上角个人中心 -->
    <button
      @click="$router.push('/profile')"
      class="absolute z-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer"
      style="top: 24px; right: 24px; width: 48px; height: 48px; font-size: 22px;"
    >
      {{ isLoggedIn ? '👤' : '🧑' }}
    </button>

    <div class="relative z-10 text-center max-w-lg">
      <!-- 图标 -->
      <div class="animate-bounce-gentle" style="font-size: clamp(48px, 12vw, 80px); margin-bottom: clamp(24px, 5vw, 50px);">🔮</div>

      <!-- 标题 -->
      <h1 class="font-extrabold text-white tracking-tight" style="font-size: clamp(32px, 9vw, 56px); margin-bottom: 24px;">读心术</h1>

      <!-- 副标题 -->
      <p class="text-white/80 leading-relaxed" style="font-size: clamp(15px, 4vw, 20px); margin-bottom: clamp(28px, 6vw, 60px); padding: 0 16px;">
        不做问卷，只聊天——<br class="sm:hidden" />AI 通过对话分析你的 MBTI 人格
      </p>

      <!-- 三个特点 -->
      <div class="grid grid-cols-3" style="gap: clamp(16px, 4vw, 40px); margin-bottom: clamp(28px, 6vw, 60px);">
        <div class="flex flex-col items-center animate-fade-in-up-1" style="gap: 16px;">
          <div class="rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center" style="width: clamp(56px, 15vw, 80px); height: clamp(56px, 15vw, 80px); font-size: 36px;">💬</div>
          <span class="text-white/90 font-medium" style="font-size: 18px;">自然对话</span>
        </div>
        <div class="flex flex-col items-center animate-fade-in-up-2" style="gap: 16px;">
          <div class="rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center" style="width: clamp(56px, 15vw, 80px); height: clamp(56px, 15vw, 80px); font-size: 36px;">🤖</div>
          <span class="text-white/90 font-medium" style="font-size: 18px;">AI 分析</span>
        </div>
        <div class="flex flex-col items-center animate-fade-in-up-3" style="gap: 16px;">
          <div class="rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center" style="width: clamp(56px, 15vw, 80px); height: clamp(56px, 15vw, 80px); font-size: 36px;">📊</div>
          <span class="text-white/90 font-medium" style="font-size: 18px;">即时报告</span>
        </div>
      </div>

      <!-- CTA 按钮 -->
      <button
        @click="$router.push('/mode')"
        class="bg-white text-[#6C5CE7] font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-pulse-soft"
        style="padding: 18px clamp(40px, 10vw, 80px); font-size: clamp(18px, 4.5vw, 24px);"
      >
        开始聊天 →
      </button>
    </div>

    <p class="absolute text-white/50 tracking-wide" style="bottom: 40px; font-size: 14px;">
      Powered by Gemini
    </p>
  </div>
</template>

<script setup>
import { useAuthGlobal } from '../composables/useAuth'
const { isLoggedIn } = useAuthGlobal()
</script>

<style>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
@keyframes float-delay {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-30px); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  50% { box-shadow: 0 0 0 16px rgba(255,255,255,0); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delay { animation: float-delay 8s ease-in-out infinite; }
.animate-fade-in-up-1 { animation: fade-in-up 0.8s ease-out 0.2s both; }
.animate-fade-in-up-2 { animation: fade-in-up 0.8s ease-out 0.4s both; }
.animate-fade-in-up-3 { animation: fade-in-up 0.8s ease-out 0.6s both; }
.animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
.animate-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }
</style>
