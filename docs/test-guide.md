# ShiftWithプロジェクト テスト総合ガイド

このドキュメントは、ShiftWithプロジェクトにおけるテスト関連の情報を集約したものです。テストの作成、実行、設定、トラブルシューティングに関する情報を1つの場所で提供します。

## 目次

1. [テスト関連ファイルの場所](#テスト関連ファイルの場所)
2. [テスト標準化ルール](#テスト標準化ルール)
3. [テスト実行方法](#テスト実行方法)
4. [テスト設定ファイル](#テスト設定ファイル)
5. [TypeScript型定義](#typescript型定義)
6. [テストのトラブルシューティング](#テストのトラブルシューティング)
7. [参照ドキュメント](#参照ドキュメント)

## テスト関連ファイルの場所

### コードとテストファイル

| 対象 | テストファイルの場所 | 命名規則 | 使用ツール |
|------|-------------------|---------|---------|
| ユーティリティ関数 | `src/utils/*/test/` | `[ファイル名].unit.test.ts` | Jest |
| UIコンポーネント | `src/components/*/test/` | `[コンポーネント名].unit.test.tsx` | Jest + RTL |
| フック | `src/hooks/*/test/` | `[フック名].unit.test.ts(x)` | Jest |
| APIクライアント | `src/lib/api/test/` | `[APIクライアント名].unit.test.ts` | Jest |
| モデル | `src/models/*/test/` | `[モデル名].unit.test.ts` | Jest |
| 機能内結合テスト | `src/features/*/test/` | `[機能名].integration.test.ts(x)` | Jest + RTL |
| 機能間結合テスト | `cypress/e2e/integration/` | `[テストシナリオ名].cy.ts` | Cypress |
| 統合テスト | `cypress/e2e/system/` | `[テストシナリオ名].cy.ts` | Cypress |
| E2Eテスト | `tests/e2e/` | `[機能名].e2e.test.ts` | Playwright |

### 設定ファイル

| ファイル | 場所 | 役割 |
|---------|------|------|
| Jest設定 | `/jest.config.js` | Jestの主要設定（テストパターン、モック、カバレッジなど） |
| Jestセットアップ | `/jest.setup.js` | Jest実行前の追加設定（カスタムマッチャーなど） |
| テスト環境設定 | `/src/setupTests.ts` | テスト環境のグローバル設定（モック、環境変数など） |
| Playwright設定 | `/playwright.config.ts` | E2Eテスト用のPlaywright設定 |
| Cypress設定 | `/cypress.config.ts` | 結合テスト用のCypress設定 |
| TypeScript設定 | `/tsconfig.jest.json` | テスト用のTypeScript設定 |
| テスト固有のTS設定 | `/src/tsconfig.json` | src内のテスト専用TypeScript設定 |

### ドキュメント

| ドキュメント | 場所 | 内容 |
|-------------|------|------|
| テスト標準化ガイド | `/docs/test-standards.md` | テスト作成の標準ルール |
| 型定義ガイド | `/src/types/README.md` | 型定義関連のガイドライン |
| **このファイル** | `/docs/test-guide.md` | テスト関連情報の総合ガイド |

## テスト標準化ルール

### テストの種類と配置

1. **単体テスト**
   - 個々の関数、メソッド、コンポーネントの機能テスト
   - Jest + React Testing Libraryを使用
   - 適切なディレクトリに配置（上記表参照）
   - 命名規則: `[ファイル名].unit.test.(ts|tsx)`

2. **機能内結合テスト**
   - 単一機能内での複数コンポーネントやモジュール間の連携テスト
   - Jest + React Testing Libraryを使用
   - `src/features/*/test/`または`src/components/features/*/test/`に配置
   - 命名規則: `[機能名].integration.test.(ts|tsx)`

3. **機能間結合テスト**
   - 複数の異なる機能間の連携を検証
   - **Cypressを使用**
   - `cypress/e2e/integration/`ディレクトリに配置
   - 命名規則: `[テストシナリオ名].cy.ts`
   - 異なる機能間のデータフロー検証に適している

4. **統合テスト**
   - 複数の機能を横断した全体フローの検証
   - **Cypressを使用**
   - `cypress/e2e/system/`ディレクトリに配置
   - 命名規則: `[テストシナリオ名].cy.ts`
   - ビジネスプロセス全体の検証に適している

5. **E2Eテスト**
   - エンドツーエンドでのユーザーフロー
   - **Playwrightを使用**
   - 完全なユーザージャーニーをテスト
   - `tests/e2e/`ディレクトリに配置
   - 命名規則: `[機能名].e2e.test.ts`
   - 複数ブラウザでの並行テストに最適

### テスト重複の防止

- 新しいテスト作成前に既存テストを確認
- 同種のテストは1つのファイルに統合
- 異なる種類のテストは分離
- 統合時は`describe`ブロックで区分け

### 命名規則の統一

- **ファイル命名**: 
  - 単体テスト: `[ファイル名].unit.test.(ts|tsx)`
  - 機能内結合テスト: `[機能名].integration.test.(ts|tsx)`
  - 機能間結合テスト: `[テストシナリオ名].cy.ts`
  - 統合テスト: `[テストシナリオ名].cy.ts`
  - E2Eテスト: `[機能名].e2e.test.ts`
- **テスト内の命名**:
  - `describe`: テスト対象の機能やコンポーネント名
  - `it/test`: 具体的なテストケースを説明する文（日本語可）

### プロジェクト固有の注意点

1. **ギバースコア関連テスト**:
   - `GiverScoreCalculator`の実装は`src/utils/giver-score/test/`に配置
   - ポイントとギバースコアの違いを明確に区別

2. **ポイントシステムテスト**:
   - 名称は`PointsSystem`に統一（末尾の's'に注意）
   - モック/実際のAPIテストを明確に区別

3. **UIコンポーネントテスト**:
   - `src/components/*/test/`に配置
   - スナップショットテストとインタラクションテストを併用

## テスト実行方法

### 基本的な実行コマンド（Jest）

```bash
# 全単体テストと機能内結合テスト実行
npm test

# 特定のテストファイル実行
npm test -- path/to/test/file.test.ts

# ファイル名パターンでテスト実行
npm test -- -t "GiverScore"

# 監視モードでテスト実行
npm run test:watch

# カバレッジレポート生成
npm test -- --coverage
```

### 機能間結合テスト・統合テスト実行（Cypress）

```bash
# 機能間結合テスト実行
npm run test:integration

# 統合テスト実行
npm run test:system

# Cypressテスト実行（ヘッドレス）
npm run cypress:run

# Cypressテスト実行（ブラウザ表示）
npm run cypress:open
```

### E2Eテスト実行（Playwright）

```bash
# すべてのE2Eテスト実行
npm run test:e2e

# モックを使用したE2Eテスト
npm run test:e2e:mock

# 実ユーザー操作のE2Eテスト
npm run test:e2e:user

# ブラウザを表示してE2Eテスト実行
npm run test:e2e:headed

# UIモードでPlaywrightテスト実行
npm run test:e2e:ui

# Playwrightレポート表示
npm run playwright:report
```

## テスト設定ファイル

### Jest設定（jest.config.js）

Jestの主要設定は`jest.config.js`で行います：

```javascript
// 主な設定項目
const customJestConfig = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストのマッチパターン
  testMatch: [
    '**/__tests__/**/*.unit.test.[jt]s?(x)',
    '**/__tests__/**/*.integration.test.[jt]s?(x)',
    '**/test/**/*.unit.test.[jt]s?(x)',
    '**/test/**/*.integration.test.[jt]s?(x)'
  ],
  
  // モジュール名マッピング
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
    // ...
  },
  
  // テスト前の設定ファイル
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/setupTests.ts'
  ],
  
  // カバレッジの設定
  collectCoverageFrom: [ /* ... */ ],
  
  // タイムアウト設定
  testTimeout: 30000,
  
  // ts-jestの設定
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
      // ...
    },
  },
  // ...
};
```

### Playwright設定（playwright.config.ts）

Playwrightの設定は`playwright.config.ts`で行います：

```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  // テストディレクトリ
  testDir: './tests/e2e',
  
  // タイムアウト設定
  timeout: 60000,
  
  // ブラウザ設定
  projects: [
    { name: 'Chrome', use: { browserName: 'chromium' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
  
  // テストマッチパターン（E2Eテストのみ）
  testMatch: '**/*.e2e.test.ts',
  
  // ...その他の設定
};
```

### Cypress設定（cypress.config.ts）

Cypressの設定は`cypress.config.ts`で行います：

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // 結合テスト用の設定
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    specPattern: [
      'cypress/e2e/integration/**/*.cy.ts',
      'cypress/e2e/system/**/*.cy.ts'
    ],
    // ...その他の設定
  },
});
```

## TypeScript型定義

テストでは、アプリケーションコードの型に加えて、テスト固有の型を活用します：

```typescript
// src/types/tests.d.ts
declare namespace Tests {
  // モックのタイプ
  interface Mock<T = any> {
    (): T;
    mockImplementation: (fn: () => T) => void;
    mockReturnValue: (value: T) => void;
    mockResolvedValue: (value: T) => void;
    mockRejectedValue: (error: any) => void;
    mockClear: () => void;
    mock: {
      calls: any[][];
      results: any[];
    };
  }

  // テストでよく使うユーティリティタイプ
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
  };
}
```

## テストのトラブルシューティング

### 共通の問題と解決策

1. **テストの孤立性の問題**:
   - 問題: テストが他のテストに依存している
   - 解決策: `beforeEach`でテスト状態をリセット、モックをクリア

2. **非同期テストの問題**:
   - 問題: 非同期コードのテストが早すぎて失敗する
   - 解決策: `await`, `waitFor`, `act`の適切な使用

3. **Cypressテストが不安定**:
   - 問題: 時々失敗する不安定なテスト
   - 解決策: `cy.wait()` や `{force: true}` オプションの適切な使用

4. **Playwrightテストのタイムアウト**:
   - 問題: テストが完了する前にタイムアウトする
   - 解決策: `test.setTimeout()`でタイムアウトを延長

### 特定テストタイプのデバッグ方法

1. **単体テスト・機能内結合テストのデバッグ**:
   ```bash
   # デバッグモードでテスト実行
   node --inspect-brk node_modules/.bin/jest --runInBand [テストファイル]
   
   # より詳細なコンソール出力
   npm test -- --verbose
   ```

2. **Cypressテストのデバッグ**:
   - Cypress UIを開き、インタラクティブにテストを実行
   - `.debug()`コマンドで特定のポイントで停止
   - DevToolsコンソールで変数を検査

3. **Playwrightテストのデバッグ**:
   ```bash
   # ヘッドフルモードで実行
   npm run test:e2e:headed
   
   # デバッグモード
   npx playwright test [テストファイル] --debug
   ```

## 参照ドキュメント

より詳細な情報は以下のドキュメントを参照してください：

- [テスト標準化ガイド](/docs/test-standards.md) - 詳細なテスト作成ルール
- [基本設計書](/docs/基本設計.md) - アプリケーション全体の設計とテストシナリオ
- [Jest公式ドキュメント](https://jestjs.io/docs/en/getting-started)
- [React Testing Library公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress公式ドキュメント](https://docs.cypress.io/)
- [Playwright公式ドキュメント](https://playwright.dev/docs/intro)

---

このガイドは継続的に更新されます。質問や提案がある場合は、プロジェクト管理者にお問い合わせください。 