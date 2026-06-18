<template>
  <div class="flex items-start gap-3 py-3">
    <!-- AI 头像 -->
    <div class="shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
      🔮
    </div>
    <div class="flex items-center gap-1.5 pt-3">
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-1" />
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-2" />
      <span class="w-2 h-2 bg-gray-300 rounded-full animate-typing-dot-3" />
    </div>
  </div>
</template>

<script setup>
</script>

<style>
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-5px); opacity: 1; }
}
.animate-typing-dot-1 { animation: typing-bounce 1.2s ease-in-out infinite; }
.animate-typing-dot-2 { animation: typing-bounce 1.2s ease-in-out 0.2s infinite; }
.animate-typing-dot-3 { animation: typing-bounce 1.2s ease-in-out 0.4s infinite; }
</style>
