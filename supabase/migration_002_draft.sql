-- ==========================================
-- conversations 表增加字段（在 Supabase SQL Editor 中执行）
-- ==========================================

-- 添加状态字段
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_progress';

-- 添加用户标签字段（草稿恢复时需要）
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_tags JSONB;

-- 添加更新时间字段
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 允许匿名 upsert（更新草稿需要 UPDATE 权限）
CREATE POLICY "Anyone can update own conversations"
  ON conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 允许匿名读取自己的草稿
CREATE POLICY "Anyone can read conversations"
  ON conversations FOR SELECT
  USING (true);

-- 删除之前的 deny update 策略（如果存在）
DROP POLICY IF EXISTS "Deny anonymous update" ON conversations;
