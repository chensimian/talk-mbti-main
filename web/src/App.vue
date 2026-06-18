<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthGlobal } from './composables/useAuth'

const auth = useAuthGlobal()

onMounted(() => {
  auth.init()
})
</script>
