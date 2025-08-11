# ShiftWith MVP MCP版リリース前テスト実行手順書

## 📋 概要

**playwright-mcp** と **mcp-supabase** を活用して、ShiftWith MVPのリリース前動作テストを効率的に実行する手順書です。

従来の手動テスト（2.5時間 → 自動化5分）を実現し、包括的な品質確認を行います。

---

## 🎯 **MCP版テストの特徴**

### **playwright-mcp の活用**
- ブラウザUIを通じたテスト実行・管理
- スクリーンショット・トレースの視覚的確認
- テスト結果のリアルタイム表示
- 複数ブラウザでの並行実行（MVPではChromiumのみ）

### **mcp-supabase の活用**  
- データベース状態の即座確認
- SQL実行によるデータ検証
- スキーマ探索・データ整合性チェック
- テストデータの高速準備・クリーンアップ

---

## 🔧 **事前準備**

### Step 1: MCP環境の確認

```bash
# MCPツールの動作確認
mcp_playwright-mcp_browser_navigate({ url: "http://localhost:3000" })

# Supabase接続の確認  
mcp_mcp-supabase_get_db_schemas({ random_string: "test" })
```

### Step 2: テスト環境の起動

```bash
# 開発サーバー起動
npm run dev

# テストデータベースの準備
npm run test:db:reset
```

---

## 🚀 **Phase 1: スモークテスト（5分）**

### **1.1 基本機能確認**

```typescript
// MCPを使った基本動作確認
test('MCP版基本機能スモークテスト', async () => {
  // 1. ホームページアクセス
  await mcp_playwright-mcp_browser_navigate({ 
    url: "http://localhost:3000" 
  });
  
  // 2. ページ状態確認
  const snapshot = await mcp_playwright-mcp_browser_snapshot({
    random_string: "home-check"
  });
  
  // 3. 主要ナビゲーション確認
  await mcp_playwright-mcp_browser_click({
    element: "教材一覧リンク",
    ref: "[data-testid='materials-link']"
  });
  
  // 4. データベース状態確認
  const materialCount = await mcp_mcp-supabase_execute_sql_query({
    query: "SELECT COUNT(*) as count FROM materials WHERE is_published = true"
  });
  
  console.log(`✅ 公開教材数: ${materialCount[0].count}件`);
});
```

### **1.2 認証システム確認**

```typescript
test('MCP版認証システム確認', async () => {
  // 1. ログインページアクセス
  await mcp_playwright-mcp_browser_navigate({ 
    url: "http://localhost:3000/auth/login" 
  });
  
  // 2. テストユーザーでログイン
  await mcp_playwright-mcp_browser_type({
    element: "メールアドレス入力",
    ref: "[data-testid='email-input']",
    text: "test@example.com"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "パスワード入力", 
    ref: "[data-testid='password-input']",
    text: "testpassword123"
  });
  
  await mcp_playwright-mcp_browser_click({
    element: "ログインボタン",
    ref: "[data-testid='login-button']"
  });
  
  // 3. ログイン成功の確認
  await mcp_playwright-mcp_browser_wait_for({
    text: "ダッシュボード"
  });
  
  // 4. セッション確認（Supabase）
  const session = await mcp_mcp-supabase_execute_sql_query({
    query: "SELECT * FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com') ORDER BY created_at DESC LIMIT 1"
  });
  
  console.log(`✅ セッション状態: ${session.length > 0 ? '有効' : '無効'}`);
});
```

---

## 🔥 **Phase 2: リリース準備テスト（25分）**

### **2.1 新規ユーザーオンボーディング**

```typescript
test('MCP版新規ユーザーオンボーディング', async () => {
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  // 1. 新規登録
  await mcp_playwright-mcp_browser_navigate({ 
    url: "http://localhost:3000/auth/signup" 
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "メールアドレス",
    ref: "[data-testid='signup-email']",
    text: testEmail
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "パスワード",
    ref: "[data-testid='signup-password']", 
    text: "testpassword123"
  });
  
  await mcp_playwright-mcp_browser_click({
    element: "登録ボタン",
    ref: "[data-testid='signup-button']"
  });
  
  // 2. データベース確認
  await mcp_playwright-mcp_browser_wait_for({ time: 2 });
  
  const newUser = await mcp_mcp-supabase_execute_sql_query({
    query: `SELECT id, email FROM auth.users WHERE email = '${testEmail}'`
  });
  
  console.log(`✅ ユーザー作成確認: ${newUser.length > 0 ? '成功' : '失敗'}`);
  
  // 3. ギバー診断への遷移
  await mcp_playwright-mcp_browser_wait_for({
    text: "ギバー診断"
  });
  
  // 4. 診断開始
  await mcp_playwright-mcp_browser_click({
    element: "診断開始ボタン",
    ref: "[data-testid='start-quiz-button']"
  });
  
  // 5. 15問の質問に回答
  for (let i = 1; i <= 15; i++) {
    await mcp_playwright-mcp_browser_click({
      element: `質問${i}の回答`,
      ref: `[data-testid='question-${i}-option-1']`
    });
    
    if (i < 15) {
      await mcp_playwright-mcp_browser_click({
        element: "次へボタン",
        ref: "[data-testid='next-button']"
      });
    }
  }
  
  // 6. 診断完了・結果確認
  await mcp_playwright-mcp_browser_click({
    element: "診断完了ボタン",
    ref: "[data-testid='complete-quiz-button']"
  });
  
  await mcp_playwright-mcp_browser_wait_for({
    text: "あなたのギバータイプ"
  });
  
  // 7. 診断結果のDB保存確認
  const quizResult = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT * FROM personality_results 
      WHERE user_id = '${newUser[0].id}'
      ORDER BY created_at DESC LIMIT 1
    `
  });
  
  console.log(`✅ 診断結果保存: ${quizResult.length > 0 ? '成功' : '失敗'}`);
  
  // 8. ポイント付与確認
  const activityLog = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT * FROM activities 
      WHERE user_id = '${newUser[0].id}' 
      AND activity_type = 'personality_quiz_completed'
    `
  });
  
  console.log(`✅ ポイント付与: ${activityLog.length > 0 ? '成功' : '失敗'}`);
});
```

### **2.2 教材作成・学習フロー**

```typescript
test('MCP版教材作成・学習フロー', async () => {
  // 1. 教材作成ページへ
  await mcp_playwright-mcp_browser_navigate({ 
    url: "http://localhost:3000/create/standard/1" 
  });
  
  // 2. 教材基本情報入力
  await mcp_playwright-mcp_browser_type({
    element: "教材タイトル",
    ref: "[data-testid='material-title']",
    text: "MCP版テスト教材"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "教材説明",
    ref: "[data-testid='material-description']",
    text: "この教材はMCPテスト用に作成されました。"
  });
  
  await mcp_playwright-mcp_browser_select_option({
    element: "カテゴリ選択",
    ref: "[data-testid='category-select']",
    values: ["grammar"]
  });
  
  await mcp_playwright-mcp_browser_select_option({
    element: "難易度選択", 
    ref: "[data-testid='difficulty-select']",
    values: ["beginner"]
  });
  
  // 3. ステップ進行
  await mcp_playwright-mcp_browser_click({
    element: "次のステップ",
    ref: "[data-testid='next-step-button']"
  });
  
  // 4. コンテンツ作成
  await mcp_playwright-mcp_browser_click({
    element: "セクション追加",
    ref: "[data-testid='add-section-button']"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "セクションタイトル",
    ref: "[data-testid='section-title']",
    text: "基本文法の説明"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "セクション内容",
    ref: "[data-testid='section-content']",
    text: "英語の基本的な文法について説明します。\n\n1. 主語と動詞\n2. 時制の基本\n3. 助動詞の使い方"
  });
  
  // 5. 教材公開
  await mcp_playwright-mcp_browser_click({
    element: "公開ボタン",
    ref: "[data-testid='publish-button']"
  });
  
  await mcp_playwright-mcp_browser_wait_for({
    text: "教材が公開されました"
  });
  
  // 6. データベース保存確認
  const createdMaterial = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT * FROM materials 
      WHERE title = 'MCP版テスト教材' 
      ORDER BY created_at DESC LIMIT 1
    `
  });
  
  console.log(`✅ 教材作成確認: ${createdMaterial.length > 0 ? '成功' : '失敗'}`);
  
  // 7. 教材一覧での表示確認
  await mcp_playwright-mcp_browser_navigate({ 
    url: "http://localhost:3000/materials" 
  });
  
  await mcp_playwright-mcp_browser_wait_for({
    text: "MCP版テスト教材"
  });
  
  // 8. 学習開始（他ユーザーとして）
  // ここで別のテストユーザーでログインして学習フローをテスト
  
  const materialId = createdMaterial[0].id;
  await mcp_playwright-mcp_browser_navigate({ 
    url: `http://localhost:3000/materials/study/${materialId}` 
  });
  
  // 9. 学習完了記録
  await mcp_playwright-mcp_browser_click({
    element: "学習完了ボタン",
    ref: "[data-testid='complete-study-button']"
  });
  
  // 10. 学習履歴確認
  const studyRecord = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT * FROM learning_progress 
      WHERE material_id = '${materialId}' 
      ORDER BY created_at DESC LIMIT 1
    `
  });
  
  console.log(`✅ 学習記録確認: ${studyRecord.length > 0 ? '成功' : '失敗'}`);
});
```

### **2.3 ポイントシステム検証**

```typescript
test('MCP版ポイントシステム検証', async () => {
  // 1. 現在のポイント確認
  const initialPoints = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT SUM(points) as total_points 
      FROM activities 
      WHERE user_id = 'test-user-id'
    `
  });
  
  const startingPoints = initialPoints[0]?.total_points || 0;
  console.log(`📊 開始時ポイント: ${startingPoints}`);
  
  // 2. ギバー行動によるポイント獲得テスト
  
  // 2.1 教材作成ポイント（50pt）
  // （上記の教材作成フローで自動的に付与される）
  
  // 2.2 コメント投稿ポイント（5pt）
  await mcp_playwright-mcp_browser_click({
    element: "コメント投稿",
    ref: "[data-testid='add-comment-button']"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "コメント内容",
    ref: "[data-testid='comment-text']",
    text: "この教材はとても分かりやすいです！"
  });
  
  await mcp_playwright-mcp_browser_click({
    element: "コメント送信",
    ref: "[data-testid='submit-comment-button']"
  });
  
  // 2.3 他ユーザーの助け（10pt）
  await mcp_playwright-mcp_browser_click({
    element: "質問に回答",
    ref: "[data-testid='answer-question-button']"
  });
  
  await mcp_playwright-mcp_browser_type({
    element: "回答内容",
    ref: "[data-testid='answer-text']",
    text: "この文法については、主語の後に動詞が来ることが重要です。"
  });
  
  await mcp_playwright-mcp_browser_click({
    element: "回答送信",
    ref: "[data-testid='submit-answer-button']"
  });
  
  // 3. ポイント付与の確認
  await mcp_playwright-mcp_browser_wait_for({ time: 2 });
  
  const finalPoints = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT SUM(points) as total_points 
      FROM activities 
      WHERE user_id = 'test-user-id'
    `
  });
  
  const endingPoints = finalPoints[0]?.total_points || 0;
  const earnedPoints = endingPoints - startingPoints;
  
  console.log(`📊 獲得ポイント: ${earnedPoints}pt`);
  console.log(`📊 最終ポイント: ${endingPoints}pt`);
  
  // 4. ギバースコア計算確認
  const giverScore = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT giver_score 
      FROM profiles 
      WHERE user_id = 'test-user-id'
    `
  });
  
  console.log(`🎯 ギバースコア: ${giverScore[0]?.giver_score || 0}`);
  
  // 5. ランキング反映確認
  const ranking = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT user_id, total_points, rank() OVER (ORDER BY total_points DESC) as ranking
      FROM (
        SELECT user_id, SUM(points) as total_points 
        FROM activities 
        WHERE created_at >= date_trunc('week', CURRENT_DATE)
        GROUP BY user_id
      ) weekly_points
      WHERE user_id = 'test-user-id'
    `
  });
  
  console.log(`🏆 週次ランキング順位: ${ranking[0]?.ranking || 'なし'}`);
});
```

---

## 📊 **Phase 3: データベース整合性テスト（10分）**

### **3.1 スキーマ整合性確認**

```typescript
test('MCP版データベーススキーマ確認', async () => {
  // 1. 主要テーブルの存在確認
  const tables = await mcp_mcp-supabase_get_tables({
    schema_name: "public"
  });
  
  const requiredTables = [
    'materials', 'activities', 'profiles', 
    'personality_results', 'learning_progress',
    'resource_categories', 'material_sections'
  ];
  
  const missingTables = requiredTables.filter(table => 
    !tables.some(t => t.name === table)
  );
  
  console.log(`📋 テーブル確認: ${missingTables.length === 0 ? '✅ 全て存在' : '❌ 不足: ' + missingTables.join(', ')}`);
  
  // 2. カラム整合性確認
  const materialSchema = await mcp_mcp-supabase_get_table_schema({
    schema_name: "public",
    table: "materials"
  });
  
  const requiredColumns = [
    'id', 'title', 'description', 'content', 
    'author_id', 'category_id', 'difficulty_level',
    'is_published', 'created_at', 'updated_at'
  ];
  
  const existingColumns = materialSchema.columns.map(col => col.column_name);
  const missingColumns = requiredColumns.filter(col => 
    !existingColumns.includes(col)
  );
  
  console.log(`📋 カラム確認: ${missingColumns.length === 0 ? '✅ 全て存在' : '❌ 不足: ' + missingColumns.join(', ')}`);
  
  // 3. 外部キー制約確認
  const foreignKeys = materialSchema.foreign_keys;
  console.log(`🔗 外部キー数: ${foreignKeys.length}`);
  
  // 4. インデックス確認
  const indexes = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('materials', 'activities', 'profiles')
    `
  });
  
  console.log(`📇 インデックス数: ${indexes.length}`);
});
```

### **3.2 データ整合性確認**

```typescript
test('MCP版データ整合性確認', async () => {
  // 1. 孤立レコードの確認
  const orphanedMaterials = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT COUNT(*) as count 
      FROM materials m 
      LEFT JOIN profiles p ON m.author_id = p.user_id 
      WHERE p.user_id IS NULL
    `
  });
  
  console.log(`👤 孤立教材数: ${orphanedMaterials[0].count}`);
  
  // 2. 重複データの確認
  const duplicateEmails = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT email, COUNT(*) as count 
      FROM auth.users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `
  });
  
  console.log(`📧 重複メール数: ${duplicateEmails.length}`);
  
  // 3. NULL値の確認
  const nullTitles = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT COUNT(*) as count 
      FROM materials 
      WHERE title IS NULL OR title = ''
    `
  });
  
  console.log(`📝 タイトル欠損: ${nullTitles[0].count}`);
  
  // 4. 日付整合性確認
  const invalidDates = await mcp_mcp-supabase_execute_sql_query({
    query: `
      SELECT COUNT(*) as count 
      FROM materials 
      WHERE updated_at < created_at
    `
  });
  
  console.log(`📅 日付不整合: ${invalidDates[0].count}`);
});
```

---

## 🎯 **実行方法**

### **1. playwright-mcpでのテスト実行**

1. **MCPブラウザ起動**:
   ```
   mcp_playwright-mcp_browser_navigate({ url: "http://localhost:3000" })
   ```

2. **スモークテスト実行**（5分）:
   - 基本機能確認
   - 認証システム確認
   - 重要ページの表示確認

3. **リリース準備テスト実行**（25分）:
   - 新規ユーザーオンボーディング
   - 教材作成・学習フロー  
   - ポイントシステム検証

4. **データベース確認**（10分）:
   - スキーマ整合性確認
   - データ整合性確認

### **2. mcp-supabaseでのデータ検証**

各テスト段階で適切なSQL実行によりデータ状態を確認:

```sql
-- テストデータクリーンアップ
DELETE FROM materials WHERE title LIKE 'MCP版テスト%';
DELETE FROM activities WHERE activity_type = 'test_activity';

-- テスト前状態確認
SELECT COUNT(*) as material_count FROM materials;
SELECT COUNT(*) as user_count FROM auth.users;
SELECT COUNT(*) as activity_count FROM activities;
```

---

## ✅ **成功基準**

### **必須項目（100% PASS必要）**
- [ ] アプリケーション基本起動
- [ ] 認証フロー（ログイン・ログアウト）
- [ ] 教材作成・保存
- [ ] ギバー診断完了
- [ ] ポイント付与・計算
- [ ] データベース整合性

### **重要項目（95% PASS必要）**  
- [ ] レスポンシブ表示
- [ ] エラーハンドリング
- [ ] 学習フロー
- [ ] コメント・フィードバック機能
- [ ] ランキング表示

### **任意項目（80% PASS推奨）**
- [ ] パフォーマンス（3秒以内）
- [ ] アクセシビリティ基本
- [ ] ソーシャル機能
- [ ] 詳細設定機能

---

## 🔧 **トラブルシューティング**

### **よくある問題と対策**

1. **MCPブラウザが起動しない**:
   ```
   # ブラウザ再インストール
   mcp_playwright-mcp_browser_install({ random_string: "install" })
   ```

2. **Supabase接続エラー**:
   ```
   # 接続確認
   mcp_mcp-supabase_get_db_schemas({ random_string: "connection-test" })
   ```

3. **テストデータが残る**:
   ```sql
   -- 手動クリーンアップ
   DELETE FROM materials WHERE title LIKE 'テスト%';
   DELETE FROM auth.users WHERE email LIKE 'test%@example.com';
   ```

4. **権限エラー**:
   ```
   # unsafe modeの有効化
   mcp_mcp-supabase_live_dangerously({ service: "database", enable: true })
   ```

---

## 📝 **実行ログ例**

```
🎭 ShiftWith MVP MCP版リリース前テスト開始
==================================================

⚡ Phase 1: スモークテスト
✅ アプリケーション基本起動: OK
✅ 認証システム確認: OK  
✅ 主要ページ表示: OK
✅ データベース接続: OK
✅ 公開教材数: 15件

🔥 Phase 2: リリース準備テスト  
✅ ユーザー作成確認: 成功
✅ 診断結果保存: 成功
✅ ポイント付与: 成功
✅ 教材作成確認: 成功
✅ 学習記録確認: 成功
📊 獲得ポイント: 65pt
🎯 ギバースコア: 127
🏆 週次ランキング順位: 3位

📊 Phase 3: データベース整合性
✅ テーブル確認: 全て存在
✅ カラム確認: 全て存在
🔗 外部キー数: 8
📇 インデックス数: 12
👤 孤立教材数: 0
📧 重複メール数: 0
📝 タイトル欠損: 0
📅 日付不整合: 0

==================================================
🎉 リリース前テスト完了: 全項目PASS
総実行時間: 4分32秒
リリース準備完了 ✅
```

これでplaywright-mcpとmcp-supabaseを活用した効率的なリリース前テストが実行できます！ 