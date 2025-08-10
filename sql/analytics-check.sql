-- Step 3: テーブル作成確認
SELECT 
  schemaname,
  tablename,
  '✅ 作成済み' as status
FROM pg_tables 
WHERE tablename IN ('user_behavior_logs', 'material_learning_sessions')
  AND schemaname = 'public'
ORDER BY tablename;
