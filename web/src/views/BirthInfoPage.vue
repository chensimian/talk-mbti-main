<template>
  <div
    style="
      min-height: 100vh;
      background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
  >
    <div
      style="
        width: 100%;
        max-width: min(460px, 100%);
        background: #fff;
        border-radius: 24px;
        padding: clamp(28px, 6vw, 40px) clamp(20px, 4vw, 32px);
        box-shadow: 0 20px 60px rgba(108, 92, 231, 0.3);
      "
    >
      <!-- 标题 -->
      <div style="text-align: center; margin-bottom: 36px;">
        <div style="font-size: 56px; margin-bottom: 16px;">🌙</div>
        <h1 style="font-size: 24px; font-weight: 700; color: #2d3436; margin: 0 0 8px;">
          请输入你的出生信息
        </h1>
        <p style="font-size: 14px; color: #b2bec3; margin: 0;">
          用于八字命理分析
        </p>
      </div>

      <!-- 表单 -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px;">
        <!-- 出生年份 -->
        <div>
          <label style="display: block; font-size: 14px; font-weight: 600; color: #636e72; margin-bottom: 8px;">
            出生年份
          </label>
          <div style="position: relative;">
            <select
              v-model="birthInfo.year"
              style="
                width: 100%;
                padding: clamp(12px, 3vw, 14px) 16px;
                font-size: 16px;
                border: 2px solid #f0ecfc;
                border-radius: 12px;
                background: #faf9fe;
                color: #2d3436;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                outline: none;
                transition: border-color 0.2s;
              "
              @focus="$event.target.style.borderColor = '#6C5CE7'"
              @blur="$event.target.style.borderColor = '#f0ecfc'"
            >
              <option value="" disabled>请选择年份</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }} 年</option>
            </select>
            <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #b2bec3;">▾</span>
          </div>
        </div>

        <!-- 出生月份 -->
        <div>
          <label style="display: block; font-size: 14px; font-weight: 600; color: #636e72; margin-bottom: 8px;">
            出生月份
          </label>
          <div style="position: relative;">
            <select
              v-model="birthInfo.month"
              style="
                width: 100%;
                padding: clamp(12px, 3vw, 14px) 16px;
                font-size: 16px;
                border: 2px solid #f0ecfc;
                border-radius: 12px;
                background: #faf9fe;
                color: #2d3436;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                outline: none;
                transition: border-color 0.2s;
              "
              @focus="$event.target.style.borderColor = '#6C5CE7'"
              @blur="$event.target.style.borderColor = '#f0ecfc'"
            >
              <option value="" disabled>请选择月份</option>
              <option v-for="m in 12" :key="m" :value="m">{{ m }} 月</option>
            </select>
            <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #b2bec3;">▾</span>
          </div>
        </div>

        <!-- 出生日期 -->
        <div>
          <label style="display: block; font-size: 14px; font-weight: 600; color: #636e72; margin-bottom: 8px;">
            出生日期
          </label>
          <div style="position: relative;">
            <select
              v-model="birthInfo.day"
              style="
                width: 100%;
                padding: clamp(12px, 3vw, 14px) 16px;
                font-size: 16px;
                border: 2px solid #f0ecfc;
                border-radius: 12px;
                background: #faf9fe;
                color: #2d3436;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                outline: none;
                transition: border-color 0.2s;
              "
              @focus="$event.target.style.borderColor = '#6C5CE7'"
              @blur="$event.target.style.borderColor = '#f0ecfc'"
            >
              <option value="" disabled>请选择日期</option>
              <option v-for="d in 31" :key="d" :value="d">{{ d }} 日</option>
            </select>
            <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #b2bec3;">▾</span>
          </div>
        </div>

        <!-- 出生时辰 -->
        <div>
          <label style="display: block; font-size: 14px; font-weight: 600; color: #636e72; margin-bottom: 8px;">
            出生时辰
          </label>
          <div style="position: relative;">
            <select
              v-model="birthInfo.shichen"
              style="
                width: 100%;
                padding: clamp(12px, 3vw, 14px) 16px;
                font-size: 16px;
                border: 2px solid #f0ecfc;
                border-radius: 12px;
                background: #faf9fe;
                color: #2d3436;
                appearance: none;
                -webkit-appearance: none;
                cursor: pointer;
                outline: none;
                transition: border-color 0.2s;
              "
              @focus="$event.target.style.borderColor = '#6C5CE7'"
              @blur="$event.target.style.borderColor = '#f0ecfc'"
            >
              <option value="" disabled>请选择时辰</option>
              <option v-for="s in shichenList" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <span style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #b2bec3;">▾</span>
          </div>
        </div>
      </div>

      <!-- 开始分析按钮 -->
      <button
        @click="handleSubmit"
        :disabled="!isValid"
        style="
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        "
        :style="{
          background: isValid ? '#6C5CE7' : '#d5d0f0',
          boxShadow: isValid ? '0 8px 24px rgba(108, 92, 231, 0.4)' : 'none',
        }"
        @mouseenter="isValid && ($event.currentTarget.style.transform = 'translateY(-2px)')"
        @mouseleave="$event.currentTarget.style.transform = 'translateY(0)'"
      >
        开始分析 ✨
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const birthInfo = reactive({
  year: '',
  month: '',
  day: '',
  shichen: '',
})

// 年份列表 1960-2010
const years = []
for (let y = 2010; y >= 1960; y--) {
  years.push(y)
}

// 时辰列表
const shichenList = [
  { value: '子时', label: '子时 (23:00-01:00)' },
  { value: '丑时', label: '丑时 (01:00-03:00)' },
  { value: '寅时', label: '寅时 (03:00-05:00)' },
  { value: '卯时', label: '卯时 (05:00-07:00)' },
  { value: '辰时', label: '辰时 (07:00-09:00)' },
  { value: '巳时', label: '巳时 (09:00-11:00)' },
  { value: '午时', label: '午时 (11:00-13:00)' },
  { value: '未时', label: '未时 (13:00-15:00)' },
  { value: '申时', label: '申时 (15:00-17:00)' },
  { value: '酉时', label: '酉时 (17:00-19:00)' },
  { value: '戌时', label: '戌时 (19:00-21:00)' },
  { value: '亥时', label: '亥时 (21:00-23:00)' },
  { value: '不确定', label: '不确定' },
]

const isValid = computed(() => {
  return birthInfo.year && birthInfo.month && birthInfo.day && birthInfo.shichen
})

function handleSubmit() {
  if (!isValid.value) return
  sessionStorage.setItem('mbti_birth_info', JSON.stringify({ ...birthInfo }))
  router.push('/tags?mode=mystical')
}
</script>
