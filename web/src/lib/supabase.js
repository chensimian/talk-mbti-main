import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * 获取或创建匿名用户 ID
 */
export function getUserId() {
  let userId = localStorage.getItem('mbti_user_id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('mbti_user_id', userId)
  }
  return userId
}

/**
 * 保存或更新对话草稿（每 5 轮调用一次）
 * 用 upsert 避免重复插入
 */
export async function saveDraft(sessionId, messages, userTags, roundCount) {
  if (!supabase) return null

  const userId = getUserId()

  try {
    const { error } = await supabase
      .from('conversations')
      .upsert({
        id: sessionId,
        user_id: userId,
        messages,
        round_count: roundCount,
        user_tags: userTags,
        status: 'in_progress',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      console.error('[Supabase] 草稿保存失败:', error)
      return null
    }
    console.log(`[Supabase] 草稿已保存 (第${roundCount}轮)`)
    return sessionId
  } catch (e) {
    console.error('[Supabase] 草稿保存异常:', e)
    return null
  }
}

/**
 * 加载未完成的对话草稿
 * 返回最近一个 in_progress 状态的会话
 */
export async function loadDraft() {
  if (!supabase) return null

  const userId = getUserId()

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  } catch (e) {
    return null
  }
}

/**
 * 保存最终报告 + 标记会话完成
 */
export async function saveResult(report, messages, userTags, roundCount, sessionId) {
  if (!supabase) {
    console.warn('[Supabase] 未配置，跳过数据保存')
    return null
  }

  const userId = getUserId()

  try {
    // 1. 保存报告
    const { data: resultData, error: resultError } = await supabase
      .from('mbti_results')
      .insert({
        user_id: userId,
        mbti_type: report.type,
        headline: report.headline,
        dimensions: report.dimensions,
        cognitive_stack: report.cognitiveStack,
        strengths: report.strengths,
        growth_areas: report.growthAreas,
        summary: report.summary,
        user_tags: userTags,
      })
      .select('id')
      .single()

    if (resultError) {
      console.error('[Supabase] 保存报告失败:', resultError)
      return null
    }

    // 2. 更新对话记录：标记完成 + 关联报告
    if (sessionId) {
      await supabase
        .from('conversations')
        .update({
          result_id: resultData.id,
          messages,
          round_count: roundCount,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
    } else {
      // 没有草稿的情况（比如用户跳过了所有标签直接出报告）
      await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          result_id: resultData.id,
          messages,
          round_count: roundCount,
          status: 'completed',
        })
    }

    return resultData.id
  } catch (e) {
    console.error('[Supabase] 保存异常:', e)
    return null
  }
}

/**
 * 获取统计数据
 */
export async function getStats() {
  if (!supabase) return null

  try {
    const [totalRes, distRes] = await Promise.all([
      supabase.rpc('get_total_count'),
      supabase.rpc('get_mbti_distribution'),
    ])

    return {
      total: totalRes.data || 0,
      distribution: distRes.data || [],
    }
  } catch (e) {
    console.error('[Supabase] 获取统计失败:', e)
    return null
  }
}
