# 🔓 Vercel認証保護解除手順書

## 🚨 **問題の詳細**
- **現象**: 本番環境で401 Unauthorizedエラー
- **原因**: Vercel Deployment Protectionが有効
- **現在URL**: `https://shiftwith-8ra3o09al-masatomans-projects.vercel.app/`
- **SSO認証**: Vercelログインページにリダイレクトされる

## 🛠 **解決手順**

### 1. Vercel Dashboard設定変更

#### 手順A：Deployment Protection解除
1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. `shiftwith-8ra3o09al-masatomans-projects`プロジェクトを選択
3. **Settings** → **General** を開く
4. **Deployment Protection**セクションを確認
5. 以下のいずれかを実行：
   - **Protection**を`Disabled`に変更
   - **Password Protection**を無効化
   - **Vercel Authentication**を無効化

#### 手順B：Environment Variables確認
```bash
# 必須環境変数
NEXT_PUBLIC_SUPABASE_URL=https://btakhtivpdhieruediwt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 代替アクセス方法

#### カスタムドメイン設定（推奨）
```bash
# カスタムドメイン追加
Domain: shiftwith.com
DNS: A Record 76.76.19.61
SSL: Let's Encrypt自動
```

#### Preview URL使用
```bash
# Git commitごとの自動Preview URL使用
https://shiftwith-git-main-masatomans-projects.vercel.app/
https://shiftwith-git-feature-branch-masatomans-projects.vercel.app/
```

### 3. 確認・テスト手順

#### A. 基本アクセス確認
```bash
# HTTP Status確認
curl -I https://shiftwith-8ra3o09al-masatomans-projects.vercel.app/

# 期待値: HTTP/2 200（認証なし）
```

#### B. API動作確認
```bash
# 診断API確認
curl https://shiftwith-8ra3o09al-masatomans-projects.vercel.app/api/debug/env-check

# Materials API確認
curl https://shiftwith-8ra3o09al-masatomans-projects.vercel.app/api/materials
```

#### C. フロントエンド確認
- トップページ表示
- ギバー診断実行
- 教材一覧表示
- ユーザー登録・ログイン

### 4. セキュリティ設定調整

#### Production環境セキュリティ
```javascript
// middleware.ts更新
const publicPaths = [
  '/',              // トップページ
  '/quiz',          // ギバー診断
  '/materials',     // 教材一覧
  '/api/materials', // 教材API
  '/api/debug/*',   // 診断API（削除予定）
];
```

#### Rate Limiting維持
```javascript
// 基本保護は維持
- DDoS保護
- API Rate Limiting  
- CORS設定
- セキュリティヘッダー
```

## 🎯 **期待される結果**

### 解除後の動作
- ✅ 本番環境への直接アクセス可能
- ✅ 診断APIでの問題特定
- ✅ Materials一覧正常表示
- ✅ Invalid API keyエラー解決

### 注意事項
- 🔒 本番データ保護は維持
- 🔒 API認証は継続実施
- 🔒 機密情報の適切な保護
- 🚨 問題解決後は保護再設定を検討

## 📞 **サポート情報**

### Vercel Support
- Documentation: https://vercel.com/docs/concepts/deployments/deployment-protection
- Contact: support@vercel.com
- Community: https://github.com/vercel/vercel/discussions

### ShiftWith Emergency
- 緊急時ロールバック: `git revert HEAD`
- 監視ダッシュボード: Vercel Analytics
- ログ確認: `vercel logs --follow` 