import { ref, computed } from 'vue'
import { supabase, getUserId } from '../lib/supabase'

/**
 * 认证状态管理
 * 支持三种模式：访客（现有 UUID）→ Supabase Auth 登录
 * Web 端先实现：访客模式 + 邮箱登录（手机号/微信登录需要后端支持，后续加）
 */
export function useAuth() {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

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
    if (!supabase) { error.value = '未配置认证服务'; return false }
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname: nickname || email.split('@')[0] }
        }
      })

      if (authError) {
        error.value = authError.message === 'User already registered'
          ? '该邮箱已注册，请直接登录'
          : authError.message
        return false
      }

      user.value = data.user

      // 合并访客数据到新账号
      await migrateGuestData(data.user.id)

      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 邮箱 + 密码登录
   */
  async function signIn(email, password) {
    if (!supabase) { error.value = '未配置认证服务'; return false }
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        const msg = authError.message
        if (msg === 'Invalid login credentials') error.value = '邮箱或密码错误'
        else if (msg.includes('Email not confirmed')) error.value = '请先验证邮箱，或使用 Google 登录'
        else error.value = msg
        return false
      }

      user.value = data.user

      // 合并访客数据
      await migrateGuestData(data.user.id)

      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
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
    guestId,
    isLoggedIn,
    isGuest,
    displayName,
    avatarUrl,
    init,
    signUp,
    signIn,
    signOut,
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
