# API・DBチーム開発ガイドライン

## 1. データベース設計原則

### 1.1 スキーマ設計
- 正規化を適切に行う（第3正規形まで）
- 外部キー制約を適切に設定
- インデックスを効率的に設計
- 命名規則の統一（スネークケース推奨）

### 1.2 マイグレーション
- 破壊的変更を避ける
- ロールバック手順を必ず用意
- マイグレーションの依存関係を明確に
- テストデータの更新も含める

### 1.3 パフォーマンス
- 実行計画の確認
- 適切なインデックス設計
- クエリの最適化
- コネクションプールの適切な設定

## 2. API設計原則

### 2.1 エンドポイント設計
- RESTful原則に従う
- URLは複数形で統一
- バージョニングを考慮
- HTTPメソッドの適切な使用

### 2.2 レスポンス設計
- 一貫した形式を維持
- 適切なHTTPステータスコード
- エラーメッセージの標準化
- ページネーション対応

### 2.3 認証・認可
- JWTトークンの適切な管理
- 権限チェックの徹底
- セッション管理の適切な実装
- レート制限の実装

## 3. コーディング規約

### 3.1 型安全性
```typescript
// 良い例
interface User {
  id: string;
  name: string;
  email: string;
}

// 悪い例
type User = any;
```

### 3.2 エラーハンドリング
```typescript
// 良い例
try {
  const result = await db.query(sql);
  return result;
} catch (error) {
  if (error instanceof DatabaseError) {
    logger.error('Database error:', error);
    throw new ApiError('Database operation failed');
  }
  throw error;
}

// 悪い例
try {
  return await db.query(sql);
} catch (error) {
  console.error(error);
  throw error;
}
```

### 3.3 非同期処理
```typescript
// 良い例
async function fetchUserData(userId: string): Promise<User> {
  const user = await db.users.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  return user;
}

// 悪い例
function fetchUserData(userId: string) {
  return db.users.findUnique({ where: { id: userId } })
    .then(user => user);
}
```

## 4. テスト規約

### 4.1 単体テスト
- 各関数の境界値テスト
- エラーケースの網羅
- モックの適切な使用
- テストの独立性確保

### 4.2 統合テスト
- エンドポイントの全パターン検証
- データベース操作の検証
- 認証フローの検証
- パフォーマンステスト

### 4.3 E2Eテスト
- 主要フローの検証
- エラー回復の検証
- 負荷テスト
- セキュリティテスト

## 5. セキュリティ要件

### 5.1 入力バリデーション
- すべてのユーザー入力の検証
- SQLインジェクション対策
- XSS対策
- CSRF対策

### 5.2 認証・認可
- パスワードハッシュ化
- トークン管理
- セッション管理
- アクセス制御

### 5.3 データ保護
- 個人情報の暗号化
- ログの適切な管理
- バックアップ戦略
- 監査ログの実装

## 6. 運用ガイドライン

### 6.1 モニタリング
- パフォーマンスメトリクス
- エラーログ監視
- リソース使用率
- セキュリティアラート

### 6.2 バックアップ
- 定期バックアップ
- リストア手順
- データ整合性チェック
- 災害復旧計画

### 6.3 メンテナンス
- 定期的な健全性チェック
- インデックス再構築
- 統計情報の更新
- キャッシュの管理 