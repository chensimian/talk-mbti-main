-- ==========================================
-- talk-mbti Supabase 建表脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ==========================================

-- 1. MBTI 测试结果表
CREATE TABLE mbti_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,              -- 匿名用户 UUID（浏览器生成）
  mbti_type VARCHAR(4) NOT NULL,      -- 如 'INFJ'
  headline TEXT,                       -- 一句话人格画像
  dimensions JSONB,                    -- 四维度百分比 {EI: {E:28, I:72, ...}, ...}
  cognitive_stack JSONB,               -- 认知功能栈
  strengths JSONB,                     -- 优势列表
  growth_areas JSONB,                  -- 成长空间列表
  summary TEXT,                        -- 总结段落
  user_tags JSONB,                     -- 用户选择的标签
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 对话记录表
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  result_id UUID REFERENCES mbti_results(id),  -- 关联的测试结果
  messages JSONB NOT NULL DEFAULT '[]',         -- [{role, content}, ...]
  round_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 启用 RLS（行级安全）
ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 4. 允许匿名插入
CREATE POLICY "Anyone can insert results"
  ON mbti_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

-- 5. 允许匿名读取（统计用）
CREATE POLICY "Anyone can read results"
  ON mbti_results FOR SELECT
  USING (true);

-- 6. MBTI 分布统计函数
CREATE OR REPLACE FUNCTION get_mbti_distribution()
RETURNS TABLE(mbti_type VARCHAR, count BIGINT) AS $$
  SELECT mbti_type, COUNT(*) as count
  FROM mbti_results
  GROUP BY mbti_type
  ORDER BY count DESC;
$$ LANGUAGE sql;

-- 7. 总用户数函数
CREATE OR REPLACE FUNCTION get_total_count()
RETURNS BIGINT AS $$
  SELECT COUNT(*) FROM mbti_results;
$$ LANGUAGE sql;
