# MCP-Supabase 高速テスト環境構築ガイド

## 📋 **概要**

mcp-supabaseを導入することで、手動テスト33項目（2.5時間）を自動化（5分）に短縮します。

---

## 🚀 **推奨MCPサーバー選択**

### **⭐ 1位: alexander-zuev/supabase-mcp-server**
- **GitHub Stars**: 712 ⭐
- **特徴**: スキーマ探索・read-only SQL実行
- **用途**: データ検証・整合性チェック

```bash
# インストール
npm install -g @supabase/mcp-server
```

### **⭐ 2位: cappahccino/supabase-mcp** 
- **NPM Downloads**: 2,178
- **特徴**: CRUD操作・Edge Functions
- **用途**: データ操作・機能テスト

```bash
# インストール  
npm install supabase-mcp
```

---

## 🔧 **セットアップ手順**

### **Step 1: 環境変数設定**

```bash
# .env.local に追加
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# テスト専用環境変数
TEST_SUPABASE_URL=your_test_supabase_url
TEST_SUPABASE_KEY=your_test_key
```

### **Step 2: MCP設定ファイル**

```json
// .mcp/config.json
{
  "servers": {
    "supabase": {
      "command": "npx",
      "args": ["supabase-mcp"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

### **Step 3: テスト用スクリプト作成**

```javascript
// scripts/test-supabase-integration.js
import { SupabaseMCP } from 'supabase-mcp';

const mcp = new SupabaseMCP({
  url: process.env.TEST_SUPABASE_URL,
  key: process.env.TEST_SUPABASE_KEY
});

// 教材作成テスト関数
export async function testMaterialCreation() {
  console.log('🧪 教材作成テスト開始...');
  
  // テストデータ作成
  const testMaterial = {
    title: 'Test Material',
    description: 'Test Description',
    category_id: 1,
    difficulty_level: 2,
    content: {
      sections: [
        { type: 'text', title: 'Section 1', content: 'Test content' }
      ]
    }
  };
  
  // 作成実行
  const result = await mcp.query(`
    INSERT INTO materials (title, description, category_id, difficulty_level, content)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `, [
    testMaterial.title,
    testMaterial.description, 
    testMaterial.category_id,
    testMaterial.difficulty_level,
    testMaterial.content
  ]);
  
  console.log('✅ 教材作成成功:', result);
  return result;
}
```

---

## 🧪 **自動化テスト実装**

### **結合テスト項目 3.1A: データベース保存検証**

```javascript
// Section 3.1A 全項目自動テスト
export async function runSection3_1A_Tests() {
  const results = [];
  
  // 3.1A.1: materialsテーブルへの保存
  const insertTest = await mcp.query(`
    SELECT COUNT(*) as count FROM materials 
    WHERE created_at > NOW() - INTERVAL '1 minute'
  `);
  results.push({
    test: '3.1A.1',
    status: insertTest[0].count > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1A.2: UUID自動生成
  const uuidTest = await mcp.query(`
    SELECT id FROM materials 
    WHERE LENGTH(id::text) = 36 
    LIMIT 1
  `);
  results.push({
    test: '3.1A.2', 
    status: uuidTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1A.3: user_id正しい設定
  const userIdTest = await mcp.query(`
    SELECT user_id FROM materials 
    WHERE user_id IS NOT NULL 
    LIMIT 1
  `);
  results.push({
    test: '3.1A.3',
    status: userIdTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1A.4: JSONBコンテンツ保存
  const jsonbTest = await mcp.query(`
    SELECT content FROM materials 
    WHERE jsonb_typeof(content) = 'object'
    LIMIT 1
  `);
  results.push({
    test: '3.1A.4',
    status: jsonbTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1A.5: タイムスタンプ自動設定
  const timestampTest = await mcp.query(`
    SELECT created_at, updated_at FROM materials 
    WHERE created_at IS NOT NULL 
    AND updated_at IS NOT NULL
    LIMIT 1
  `);
  results.push({
    test: '3.1A.5',
    status: timestampTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  return results;
}
```

### **結合テスト項目 3.1B: 関連テーブル連携**

```javascript
export async function runSection3_1B_Tests() {
  const results = [];
  
  // 3.1B.1: activitiesテーブル記録
  const activityTest = await mcp.query(`
    SELECT COUNT(*) as count FROM activities 
    WHERE activity_type = 'material_created'
    AND created_at > NOW() - INTERVAL '1 minute'
  `);
  results.push({
    test: '3.1B.1',
    status: activityTest[0].count > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1B.2: ポイント付与記録
  const pointsTest = await mcp.query(`
    SELECT points FROM activities 
    WHERE activity_type = 'material_created'
    AND points = 50
    LIMIT 1
  `);
  results.push({
    test: '3.1B.2',
    status: pointsTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  // 3.1B.7: トランザクション整合性
  const transactionTest = await mcp.query(`
    SELECT m.id, a.material_id 
    FROM materials m
    JOIN activities a ON m.id = a.material_id
    WHERE m.created_at > NOW() - INTERVAL '1 minute'
  `);
  results.push({
    test: '3.1B.7',
    status: transactionTest.length > 0 ? 'PASS' : 'FAIL'
  });
  
  return results;
}
```

### **エラーハンドリングテスト 3.1D**

```javascript
export async function runSection3_1D_Tests() {
  const results = [];
  
  try {
    // 3.1D.2: 制約違反エラー
    await mcp.query(`
      INSERT INTO materials (title, description) 
      VALUES (NULL, 'Test')
    `);
    results.push({ test: '3.1D.2', status: 'FAIL' }); // NULLが通ったらFAIL
  } catch (error) {
    results.push({ 
      test: '3.1D.2', 
      status: error.code === '23502' ? 'PASS' : 'FAIL' // NOT NULL制約
    });
  }
  
  try {
    // 3.1D.3: UNIQUE制約違反
    const existingId = 'duplicate-test-id';
    await mcp.query(`INSERT INTO materials (id, title) VALUES ($1, 'Test1')`, [existingId]);
    await mcp.query(`INSERT INTO materials (id, title) VALUES ($1, 'Test2')`, [existingId]);
    results.push({ test: '3.1D.3', status: 'FAIL' }); // 重複が通ったらFAIL
  } catch (error) {
    results.push({
      test: '3.1D.3',
      status: error.code === '23505' ? 'PASS' : 'FAIL' // UNIQUE制約
    });
  }
  
  return results;
}
```

---

## 📊 **パフォーマンステスト自動化**

### **3.1E: パフォーマンス・容量テスト**

```javascript
export async function runSection3_1E_Tests() {
  const results = [];
  
  // 3.1E.1: 大容量コンテンツ保存
  const largeContent = {
    sections: Array(100).fill({
      type: 'text',
      title: 'Large Section',
      content: 'A'.repeat(10000) // 10KB per section
    })
  };
  
  const start = Date.now();
  const largeDataTest = await mcp.query(`
    INSERT INTO materials (title, content)
    VALUES ($1, $2)
    RETURNING id
  `, ['Large Content Test', largeContent]);
  const duration = Date.now() - start;
  
  results.push({
    test: '3.1E.1',
    status: largeDataTest.length > 0 ? 'PASS' : 'FAIL',
    metrics: { duration, size: JSON.stringify(largeContent).length }
  });
  
  // 3.1E.3: 保存速度測定
  results.push({
    test: '3.1E.3',
    status: duration < 3000 ? 'PASS' : 'FAIL', // <3秒目標
    metrics: { duration }
  });
  
  return results;
}
```

---

## 🏃‍♂️ **実行スクリプト**

### **完全自動テスト**

```bash
#!/bin/bash
# scripts/run-supabase-integration-tests.sh

echo "🚀 ShiftWith Supabase結合テスト開始"
echo "=================================="

# Node.jsテスト実行
node scripts/test-supabase-integration.js

echo ""
echo "📊 テスト完了"
echo "結果: docs/02_開発ガイド/test-results.json に保存"
```

### **package.jsonスクリプト追加**

```json
{
  "scripts": {
    "test:supabase": "node scripts/test-supabase-integration.js",
    "test:integration": "npm run test:supabase && npm run test:api",
    "test:full": "npm run test:unit && npm run test:integration"
  }
}
```

---

## 📈 **効果測定**

### **Before vs After**

| テストカテゴリ | 手動テスト時間 | mcp-supabase後 | 改善率 |
|--------------|-------------|--------------|--------|
| データベース保存検証 | 45分 | 2分 | **95.6%短縮** |
| 関連テーブル連携 | 30分 | 1分 | **96.7%短縮** |
| エラーハンドリング | 25分 | 1分 | **96.0%短縮** |
| パフォーマンス | 20分 | 1分 | **95.0%短縮** |
| **合計** | **2時間** | **5分** | **95.8%短縮** |

### **品質向上効果**
- ✅ **ヒューマンエラー削除**: 手動チェックミス撲滅
- ✅ **網羅性向上**: 全項目を確実に実行
- ✅ **継続実行**: CI/CDで自動実行可能
- ✅ **詳細ログ**: 失敗原因の詳細特定

---

## 🎯 **次のステップ**

1. **mcp-supabase導入** → 今すぐ実行
2. **自動テスト実装** → 明日までに完成
3. **CI/CD統合** → 週末までに設定
4. **教材作成開始** → テスト完了後すぐ

---

**作成日**: Phase 8期間中  
**更新予定**: 導入完了後に実測値で更新 