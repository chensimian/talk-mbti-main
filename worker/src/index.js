/**
 * Gemini API 反向代理 - Cloudflare Worker
 * 通过 Cloudflare AI Gateway 路由请求，解决中国区域 IP 限制
 */

// AI Gateway 会代理到 Google AI Studio，不再直连 Google
const AI_GATEWAY_BASE = 'https://gateway.ai.cloudflare.com/v1/84d1ed36e049157a329d8dff86b1999b/gemini-proxy/google-ai-studio'

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }

    try {
      const url = new URL(request.url)

      // 构建 AI Gateway 目标 URL
      // 原始路径类似: /v1beta/models/gemini-2.0-flash:generateContent
      // 拼接成: {gateway_base}/v1beta/models/gemini-2.0-flash:generateContent?key=xxx
      const pathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
      const targetUrl = new URL(`${AI_GATEWAY_BASE}/${pathname}${url.search}`)
      targetUrl.searchParams.delete('key')
      targetUrl.searchParams.set('key', env.GEMINI_API_KEY)

      const body = await request.arrayBuffer()

      const response = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': request.headers.get('Content-Type') || 'application/json',
          // AI Gateway 认证
          'cf-aig-authorization': `Bearer ${env.AI_GATEWAY_TOKEN}`,
        },
        body: body,
      })

      // 检查是否地区受限（理论上通过 AI Gateway 不会再出现）
      if (response.status === 400) {
        const text = await response.text()
        if (text.includes('User location is not supported')) {
          return new Response(JSON.stringify({
            error: '当前地区暂不支持，请稍后重试',
            detail: 'Google Gemini API 限制了当前请求区域'
          }), {
            status: 451,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' },
          })
        }
        return new Response(text, {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        })
      }

      const headers = new Headers(response.headers)
      Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v))

      return new Response(response.body, {
        status: response.status,
        headers,
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }
  },
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key, x-goog-api-client',
    'Access-Control-Max-Age': '86400',
  }
}
