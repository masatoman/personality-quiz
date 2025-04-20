# リファクタリング提案メモ

## UserActivityTracker 再実装の提案 (2024-03-XX)

### 現状分析

1. **進行中のタスク状況**
   - テスト構造の再配置（req-3: 2/3完了）
   - テストファイル命名規則の統一（req-5: 3/4完了）
   - テスト環境の設定（req-7: 未着手）
   - テスト標準の更新（req-25: 未着手）
   - 複数のリンターエラー修正タスク（req-35, 36, 37, 45-50）

2. **問題点**
   - リンターエラー修正タスクの重複
   - テスト構造の再編成が複数回計画
   - 多くのタスクが未着手
   - 型定義の根本的な問題
   - テスト環境の不完全さ

### 提案：0から作り直し

#### 実装手順

1. **環境整備**
   ```bash
   # 新規ブランチ作成
   git checkout -b refactor/user-activity-tracker
   ```

2. **ディレクトリ構造**
   ```
   src/utils/activity/
   ├── __tests__/
   │   ├── factories.ts      # テスト用のモックファクトリ
   │   ├── helpers.ts        # テストヘルパー関数
   │   ├── types.ts          # テスト用の型定義
   │   └── UserActivityTracker.test.ts
   ├── types/
   │   └── index.ts          # 共有の型定義
   ├── UserActivityTracker.ts
   └── index.ts
   ```

3. **型定義の明確化**
   ```typescript
   // types/index.ts
   export interface ActivityDetails {
     type: ActivityType;
     metadata: Record<string, unknown>;
   }

   export interface UserActivity {
     id: number;
     userId: string;
     type: ActivityType;
     details: ActivityDetails;
     timestamp: Date;
   }
   ```

4. **テストヘルパーの実装**
   ```typescript
   // __tests__/helpers.ts
   export function setupActivityTest() {
     const mockClient = createMockSupabaseClient();
     const tracker = new UserActivityTracker(mockClient);
     return { mockClient, tracker };
   }
   ```

5. **テストファーストでの実装**
   - 各メソッドのテストを先に書く
   - 型定義に基づいて実装
   - エラーハンドリングの徹底

### メリット

1. **品質向上**
   - 明確な型定義
   - テストカバレッジの向上
   - エラーハンドリングの改善

2. **保守性**
   - 一貫した設計
   - ドキュメント化された型
   - テストの可読性向上

3. **開発効率**
   - 重複タスクの解消
   - 明確な実装方針
   - 将来の拡張性

### 注意点

1. **移行戦略**
   - 既存機能の完全な把握
   - 段階的な移行計画
   - 下位互換性の維持

2. **リスク**
   - 既存の依存関係への影響
   - 移行期間中の二重メンテ
   - テスト漏れの可能性

### 次のステップ

1. [ ] 既存コードの完全な機能分析
2. [ ] 新しい型定義の設計レビュー
3. [ ] テスト計画の作成
4. [ ] モックとテストヘルパーの実装
5. [ ] 段階的な実装とテスト
6. [ ] レビューとフィードバック
7. [ ] 段階的なデプロイ計画

### 参考ドキュメント
- docs/test-standards.md
- docs/test-guide.md
- docs/ディレクトリ構造ベストプラクティス.md 