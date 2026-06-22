import { ref, computed } from 'vue'
import { supabase, getUserId } from '../lib/supabase'

const SIGNUP_COOLDOWN_SECONDS = 60

function getRawErrorMessage(rawError) {
  if (!rawError) return ''
  if (typeof rawError === 'string') return rawError
  return rawError.message || rawError.error_description || rawError.error || ''
}

export function isAuthRateLimitError(rawError) {
  const msg = getRawErrorMessage(rawError).toLowerCase()
  const code = String(rawError?.code || rawError?.error_code || '').toLowerCase()
  return (
    code.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('for security purposes')
  )
}

function isAuthNetworkError(rawError) {
  const msg = getRawErrorMessage(rawError).toLowerCase()
  const name = String(rawError?.name || '').toLowerCase()
  return (
    name.includes('typeerror') ||
    msg.includes('load failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('fetch failed')
  )
}

export function getAuthErrorMessage(rawError, action = '认证') {
  const msg = getRawErrorMessage(rawError)
  const lower = msg.toLowerCase()
  const code = String(rawError?.code || rawError?.error_code || '').toLowerCase()

  if (!msg && !code) return `${action}失败，请稍后重试`
  if (isAuthRateLimitError(rawError)) {
    return action === '注册'
      ? '注册邮件发送过于频繁，请稍后再试，或先使用 Google 登录/访客模式继续。'
      : '请求过于频繁，请稍后再试，或先使用访客模式继续。'
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return '该邮箱已注册，请直接登录'
  }
  if (lower.includes('invalid login credentials')) {
    return '邮箱或密码错误'
  }
  if (lower.includes('email not confirmed')) {
    return '请先验证邮箱，或使用 Google 登录'
  }
  if (lower.includes('weak password') || (lower.includes('password') && lower.includes('6'))) {
    return '密码至少 6 位，请换一个更安全的密码'
  }
  if (lower.includes('signup') && lower.includes('disabled')) {
    return '邮箱注册暂不可用，请使用 Google 登录或访客模式继续。'
  }
  if (lower.includes('provider') && lower.includes('not enabled')) {
    return 'Google 登录暂未启用，请先使用邮箱登录或访客模式继续。'
  }
  if (isAuthNetworkError(rawError)) {
    return '连接认证服务失败，请检查网络后重试；如果在微信内打不开，请用系统浏览器打开本站。'
  }
  if (lower.includes('timeout')) {
    return '认证服务响应超时，请稍后重试。'
  }

  return `${action}失败，请稍后重试`
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

/**
 * 认证状态管理
 * 支持三种模式：访客（现有 UUID）→ Supabase Auth 登录
 * Web 端先实现：访客模式 + 邮箱登录（手机号/微信登录需要后端支持，后续加）
 */
export function useAuth() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const notice = ref(null)

  // 访客 ID（兼容现有系统）
  const guestId = computed(() => getUserId())

  // 是否已登录（Supabase Auth）
  const isLoggedIn = computed(() => !!user.value)

  // 是否是访客
  const isGuest = computed(() => !user.value)

  // 显示名称
  const displayName = computed(() => {
    if (user.value?.user_metadata?.nickname) return user.value.user_metadata.nickname
    if (user.value?.email) return user.value.email.split('@')[0]
    return '访客用户'
  })

  // 头像
  const avatarUrl = computed(() => {
    return user.value?.user_metadata?.avatar_url || null
  })

  /**
   * 初始化：检查现有会话，处理 OAuth 回调
   */
  async function init() {
    if (!supabase) return

    try {
      // 处理 OAuth 回调（Google 登录后 URL hash 里带 access_token）
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        // Supabase 会自动从 hash 中提取 token 并建立会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.warn('[Auth] OAuth 回调处理失败:', sessionError)
        }
        if (session?.user) {
          user.value = session.user
          await migrateGuestData(session.user.id)
        }
        // 清除 URL 中的 token，跳转到之前要去的页面或首页
        const redirect = sessionStorage.getItem('redirect_after_login')
        if (redirect) {
          sessionStorage.removeItem('redirect_after_login')
          window.location.hash = '#' + redirect
        } else {
          window.location.hash = '#/'
        }
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
      }

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user || null
        // OAuth 登录成功后自动迁移数据
        if (event === 'SIGNED_IN' && session?.user) {
          migrateGuestData(session.user.id)
        }
      })
    } catch (e) {
      console.warn('[Auth] 初始化失败:', e)
    }
  }

  /**
   * 邮箱 + 密码注册
   */
  async function signUp(email, password, nickname) {
    if (!supabase) { error.value = '未配置认证服务'; return { ok: false } }
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || !password) {
      error.value = '请填写邮箱和密码'
      return { ok: false }
    }
    if (password.length < 6) {
      error.value = '密码至少 6 位'
      return { ok: false }
    }

    loading.value = true
    error.value = null
    notice.value = null

    try {
      const emailRedirectTo = `${window.location.origin}${window.location.pathname}#/login`
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { nickname: String(nickname || '').trim() || normalizedEmail.split('@')[0] },
          emailRedirectTo,
        }
      })

      if (authError) {
        error.value = getAuthErrorMessage(authError, '注册')
        return { ok: false, rateLimited: isAuthRateLimitError(authError) }
      }

      if (Array.isArray(data?.user?.identities) && data.user.identities.length === 0) {
        error.value = '该邮箱已注册，请直接登录'
        return { ok: false, existingUser: true }
      }

      if (data?.session?.user) {
        user.value = data.session.user

        // 合并访客数据到新账号
        await migrateGuestData(data.session.user.id)

        return { ok: true, signedIn: true }
      }

      if (data?.user) {
        notice.value = '注册申请已提交，请打开邮箱完成验证后再登录。没有收到邮件时，请稍后再试或使用 Google 登录。'
        return { ok: true, needsEmailConfirmation: true }
      }

      error.value = '注册失败，请稍后重试'
      return { ok: false }
    } catch (e) {
      error.value = getAuthErrorMessage(e, '注册')
      return { ok: false, networkError: isAuthNetworkError(e) }
    } finally {
      loading.value = false
    }
  }

  /**
   * 邮箱 + 密码登录
   */
  async function signIn(email, password) {
    if (!supabase) { error.value = '未配置认证服务'; return false }
    const normalizedEmail = normalizeEmail(email)
    loading.value = true
    error.value = null
    notice.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (authError) {
        error.value = getAuthErrorMessage(authError, '登录')
        return false
      }

      user.value = data.user

      // 合并访客数据
      await migrateGuestData(data.user.id)

      return true
    } catch (e) {
      error.value = getAuthErrorMessage(e, '登录')
      return false
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    error.value = null
    notice.value = null
  }

  /**
   * 退出登录
   */
  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    user.value = null
  }

  /**
   * 将访客数据迁移到正式用户
   * 把 guestId 产生的 conversations 和 mbti_results 的 user_id 更新为 auth user id
   */
  async function migrateGuestData(authUserId) {
    if (!supabase) return
    const oldGuestId = getUserId()

    try {
      // 迁移对话记录
      await supabase
        .from('conversations')
        .update({ user_id: authUserId })
        .eq('user_id', oldGuestId)

      // 迁移 MBTI 结果
      await supabase
        .from('mbti_results')
        .update({ user_id: authUserId })
        .eq('user_id', oldGuestId)

      // 更新本地存储的 user_id
      localStorage.setItem('mbti_user_id', authUserId)
    } catch (e) {
      console.warn('[Auth] 数据迁移失败:', e)
    }
  }

  /**
   * 获取当前有效的 user_id（登录用户用 auth id，访客用 localStorage UUID）
   */
  function getEffectiveUserId() {
    return user.value?.id || getUserId()
  }

  return {
    user,
    loading,
    error,
    notice,
    signupCooldownSeconds: SIGNUP_COOLDOWN_SECONDS,
    guestId,
    isLoggedIn,
    isGuest,
    displayName,
    avatarUrl,
    init,
    signUp,
    signIn,
    signOut,
    clearMessages,
    getEffectiveUserId,
  }
}

// 单例：全局共享状态
let _instance = null
export function useAuthGlobal() {
  if (!_instance) {
    _instance = useAuth()
  }
  return _instance
}
