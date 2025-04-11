# ShiftWith テスト実装ガイド

このガイドでは、ShiftWithアプリケーションのテスト方法について説明します。

## テストの種類

ShiftWithでは以下の種類のテストを実装しています：

1. **ユニットテスト** - 個々の関数やコンポーネントの機能をテスト
2. **統合テスト** - 複数のコンポーネントやAPIの連携をテスト
3. **E2Eテスト** - エンドツーエンドでユーザーフローをテスト

## テストの実行方法

### ユニットテスト・統合テスト (Jest)

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test -- src/app/__tests__/PointsSystem.unit.test.ts

# ウォッチモードでテストを実行（変更を監視して自動再実行）
npm run test:watch
```

### E2Eテスト (Playwright)

```bash
# 必要なブラウザをインストール（初回のみ）
npm run playwright:install

# すべてのE2Eテストを実行
npm run test:playwright

# モックを使用したE2Eテストのみ実行
npm run test:e2e:mock

# 実際のユーザーフローをシミュレートしたE2Eテストを実行
npm run test:e2e:user

# ブラウザを表示して実行（デバッグ時に便利）
npm run test:e2e:headed

# Playwrightの対話型UIでテストを実行
npm run test:e2e:ui

# テストレポートを表示
npm run playwright:report
```

## テストファイルの命名規則

- `*.unit.test.ts` - ユニットテスト
- `*.integration.test.ts` - 統合テスト
- `*.e2e.test.ts` - モックを使用したE2Eテスト
- `*.e2e-user.test.ts` - 実際のユーザーフローをシミュレートしたE2Eテスト

## ポイントシステムのテスト

ポイントシステムのテストは以下のファイルに実装されています：

- `src/app/__tests__/PointsSystem.unit.test.ts` - ポイント関連ユーティリティのユニットテスト
- `src/app/__tests__/PointsSystem.e2e.test.ts` - ポイントシステムのE2Eテスト（モック使用）
- `src/app/__tests__/PointsSystem.e2e-user.test.ts` - 実際のユーザーフローをシミュレートしたE2Eテスト

### テストシナリオ

#### ユニットテスト
- ポイント消費関数のテスト
- ポイント残高取得関数のテスト
- 購入可能アイテムの定義確認

#### E2Eテスト（モック）
- ダッシュボードでのポイント残高表示
- ポイント履歴の表示
- 教材完了時のポイント付与
- ポイントが十分にある場合の報酬購入
- ポイント不足時の報酬購入失敗

#### E2Eテスト（実ユーザーフロー）
- ログイン後のポイント残高確認 → 教材完了 → ポイント履歴確認
- ギバースコアの変動確認
- 報酬交換と在庫確認

## テスト作成のガイドライン

1. **独立性** - 各テストは他のテストに依存せず、単独で実行できるようにする
2. **再現性** - テストは常に同じ結果を返すようにする
3. **速度** - ユニットテストは高速に実行できるようにする
4. **可読性** - テストコードは明確で理解しやすいようにする
5. **メンテナンス性** - テストが壊れやすくならないように適切な抽象化を行う

## テスト環境の設定

テスト環境の設定は以下のファイルで行っています：

- `jest.config.js` - Jestの設定
- `playwright.config.ts` - Playwrightの設定
- `src/tests/global-setup.ts` - Playwrightのグローバルセットアップ
- `src/tests/global-teardown.ts` - Playwrightのグローバルティアダウン

## CI/CD連携

GitHub Actionsでの自動テスト実行も設定しています。以下のワークフローが実行されます：

1. PRの作成時にユニットテストとE2Eテストを実行
2. mainブランチにマージ後、全テストを実行し、成功した場合のみデプロイ

## トラブルシューティング

### テスト失敗時の対応

1. テストエラーメッセージを確認
2. テスト実行環境（ブラウザ・Node.jsのバージョンなど）を確認
3. テスト対象のコードに変更がないか確認
4. 必要に応じてテストコードを修正または更新

### 重複テストの解消について

プロジェクト内で発見された重複テストの問題に対処するため、以下の整理を実施しました：

1. **テストファイルの統合**:
   - `src/utils/__tests__/GiverScoreCalculator.test.ts` と `src/app/__tests__/GiverScoreCalculator.test.ts` を統合
   - `src/utils/__tests__/GiverScoreDisplay.test.tsx` を `src/components/__tests__/GiverScoreDisplay.test.tsx` に統合
   - `src/app/__tests__/PointSystem.test.ts` と `src/app/__tests__/PointsSystem.test.ts` を統合

2. **テスト配置のガイドライン**:
   - コンポーネントテスト → `src/components/__tests__/`
   - ユーティリティ関数テスト → `src/utils/__tests__/`
   - E2Eテスト → `src/app/__tests__/`（ファイル名に`.e2e.test.ts`を使用）

3. **命名の統一**:
   - ポイントシステムのテストは `PointsSystem` に統一（末尾に's'あり）

今後テストを追加する際は、上記のガイドラインに従い、既存のテストファイルを確認してから新規テストを作成してください。同じ機能に対する複数のテストファイルの存在を避け、テストの重複を防止することが重要です。

### よくある問題

- **タイムアウトエラー**: 非同期処理の完了を適切に待つ
- **セレクターエラー**: UIの変更を反映するためにセレクターを更新
- **モックエラー**: APIレスポンスの形式変更を反映

より詳細な情報については、[Jest公式ドキュメント](https://jestjs.io/docs/getting-started)や[Playwright公式ドキュメント](https://playwright.dev/docs/intro)を参照してください。 