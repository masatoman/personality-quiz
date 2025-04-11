# APIインターフェース仕様書

## 関連ドキュメント
- [データベース詳細設計](../01_プロジェクト概要/05_データベース詳細設計.md)
- [コンポーネント詳細設計](../01_プロジェクト概要/06_コンポーネント詳細設計.md)
- [セキュリティ設計](./05_セキュリティ設計.md)
- [デプロイメント構成図](./06_デプロイメント構成図.md)
- [UI/UXデザイン仕様書](../01_プロジェクト概要/07_UI_UXデザイン仕様書.md)

## 概要
本ドキュメントはShiftWithアプリケーションのAPIインターフェースの詳細を記述します。Supabaseを利用しているため、REST APIとリアルタイムSubscription APIの両方の仕様を含みます。

## 共通仕様

### ベースURL
```
https://[PROJECT_ID].supabase.co/rest/v1/
```

### 認証
すべてのAPIリクエストには以下のヘッダーが必要です：

```
apikey: [ANON_KEY]
Authorization: Bearer [USER_TOKEN]
```

### レスポンス形式
標準的なJSONレスポンス形式：

```json
{
  "data": [レスポンスデータ],
  "error": null | { "message": "エラーメッセージ", "code": "エラーコード" }
}
```

### エラーコード
| コード | 説明 |
|------|------|
| 400 | 不正なリクエスト |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソースが見つからない |
| 409 | リソース競合 |
| 422 | バリデーションエラー |
| 429 | レート制限超過 |
| 500 | サーバーエラー |

## ユーザー認証 API

### サインアップ
```
POST /auth/v1/signup
```

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "username123"
}
```

**レスポンス**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2023-06-01T12:00:00Z"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### サインイン
```
POST /auth/v1/token?grant_type=password
```

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**レスポンス**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### サインアウト
```
POST /auth/v1/logout
```

**レスポンス**
```json
{
  "message": "Success"
}
```

### パスワードリセット
```
POST /auth/v1/recover
```

**リクエスト**
```json
{
  "email": "user@example.com"
}
```

**レスポンス**
```json
{
  "message": "Success"
}
```

## ユーザープロフィール API

### プロフィール取得
```
GET /profiles?id=eq.[USER_ID]&select=*
```

**レスポンス**
```json
[
  {
    "id": "uuid",
    "username": "username123",
    "display_name": "表示名",
    "bio": "自己紹介",
    "avatar_url": "https://example.com/avatar.jpg",
    "giver_level": 3,
    "total_points": 1250,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
]
```

### プロフィール更新
```
PATCH /profiles?id=eq.[USER_ID]
```

**リクエスト**
```json
{
  "display_name": "新しい表示名",
  "bio": "新しい自己紹介",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**レスポンス**
```json
{
  "message": "Success"
}
```

## 教材 API

### 教材一覧取得
```
GET /materials?select=*&order=created_at.desc&limit=20&offset=0
```

**パラメータ**
- category: カテゴリでフィルタリング
- difficulty: 難易度でフィルタリング
- author_id: 作成者でフィルタリング
- status: 公開状態でフィルタリング

**レスポンス**
```json
[
  {
    "id": "uuid",
    "title": "教材タイトル",
    "description": "教材説明",
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "author_id": "uuid",
    "category": "プログラミング",
    "difficulty": 3,
    "status": "published",
    "view_count": 120,
    "like_count": 15,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  },
  // ...
]
```

### 教材詳細取得
```
GET /materials?id=eq.[MATERIAL_ID]&select=*,material_sections(*),author:profiles!author_id(username,display_name,avatar_url)
```

**レスポンス**
```json
[
  {
    "id": "uuid",
    "title": "教材タイトル",
    "description": "教材説明",
    "thumbnail_url": "https://example.com/thumbnail.jpg",
    "author_id": "uuid",
    "category": "プログラミング",
    "difficulty": 3,
    "status": "published",
    "view_count": 120,
    "like_count": 15,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z",
    "material_sections": [
      {
        "id": "uuid",
        "material_id": "uuid",
        "title": "セクションタイトル",
        "content": "セクション内容",
        "order": 1
      }
      // ...
    ],
    "author": {
      "username": "username123",
      "display_name": "表示名",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
]
```

### 教材作成
```
POST /materials
```

**リクエスト**
```json
{
  "title": "新しい教材",
  "description": "教材の説明",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "category": "プログラミング",
  "difficulty": 2,
  "status": "draft"
}
```

**レスポンス**
```json
{
  "id": "uuid",
  "title": "新しい教材",
  "created_at": "2023-06-01T12:00:00Z"
}
```

### 教材更新
```
PATCH /materials?id=eq.[MATERIAL_ID]
```

**リクエスト**
```json
{
  "title": "更新された教材",
  "description": "更新された説明",
  "status": "published"
}
```

**レスポンス**
```json
{
  "message": "Success"
}
```

### 教材削除
```
DELETE /materials?id=eq.[MATERIAL_ID]
```

**レスポンス**
```json
{
  "message": "Success"
}
```

## ギバースコア API

### ギバースコア履歴取得
```
GET /giver_scores?user_id=eq.[USER_ID]&order=created_at.desc&select=*&limit=50
```

**レスポンス**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "score_type": "material_create",
    "score_value": 50,
    "activity_id": "uuid",
    "description": "教材を作成しました",
    "created_at": "2023-06-01T12:00:00Z"
  },
  // ...
]
```

### ギバースコア集計取得
```
GET /rpc/get_giver_score_summary
```

**リクエスト**
```json
{
  "p_user_id": "uuid"
}
```

**レスポンス**
```json
{
  "total_score": 1250,
  "current_level": 3,
  "next_level_threshold": 2000,
  "level_progress": 0.625,
  "weekly_activities": 8,
  "monthly_rank": 12
}
```

## 通知 API

### 通知一覧取得
```
GET /notifications?user_id=eq.[USER_ID]&order=created_at.desc&select=*&limit=20
```

**レスポンス**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "comment",
    "title": "新しいコメント",
    "content": "あなたの教材にコメントがつきました",
    "link": "/materials/uuid",
    "is_read": false,
    "created_at": "2023-06-01T12:00:00Z"
  },
  // ...
]
```

### 通知既読更新
```
PATCH /notifications?id=eq.[NOTIFICATION_ID]
```

**リクエスト**
```json
{
  "is_read": true
}
```

**レスポンス**
```json
{
  "message": "Success"
}
```

## リアルタイムサブスクリプション

### 通知サブスクリプション
```javascript
const subscription = supabase
  .from('notifications')
  .on('INSERT', payload => {
    // 新しい通知が作成された時の処理
  })
  .eq('user_id', userId)
  .subscribe()
```

### コメントサブスクリプション
```javascript
const subscription = supabase
  .from('material_comments')
  .on('INSERT', payload => {
    // 新しいコメントが作成された時の処理
  })
  .eq('material_id', materialId)
  .subscribe()
```

## ストレージ API

### ファイルアップロード
```
POST /storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
```

**リクエスト**
```
Content-Type: multipart/form-data
file: [バイナリデータ]
```

**レスポンス**
```json
{
  "Key": "public/[BUCKET_NAME]/[FILE_PATH]",
  "ETag": "etag",
  "Size": 12345,
  "Bucket": "[BUCKET_NAME]",
  "Path": "[FILE_PATH]"
}
```

### ファイルダウンロードURL取得
```
GET /storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
```

**レスポンス**
```
ファイルのバイナリデータ
```

### ファイル削除
```
DELETE /storage/v1/object/public/[BUCKET_NAME]/[FILE_PATH]
```

**レスポンス**
```json
{
  "message": "Success"
}
```

## パフォーマンス最適化

### レスポンスサイズの最適化
- 必要なフィールドのみを選択: `select=id,title,created_at`
- ネストされたリレーションの制限: `select=*,comments(id,content).limit(5)`

### キャッシュの活用
- Cache-Control ヘッダーの利用
- 静的コンテンツのCDN利用

## セキュリティ考慮事項

### RLSポリシー
すべてのテーブルにRow Level Securityポリシーを適用し、適切なアクセス制御を行います：

```sql
-- 例: materialsテーブルのRLSポリシー
-- 公開された教材は誰でも閲覧可能
CREATE POLICY "公開された教材は誰でも閲覧可能" ON materials
FOR SELECT USING (status = 'published');

-- 自分の教材のみ編集・削除可能
CREATE POLICY "自分の教材のみ編集可能" ON materials
FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "自分の教材のみ削除可能" ON materials
FOR DELETE USING (auth.uid() = author_id);

-- 新規作成時は作成者IDを強制的に設定
CREATE POLICY "新規作成時は作成者IDを設定" ON materials
FOR INSERT WITH CHECK (author_id = auth.uid());
```

### レート制限
- 認証エンドポイント: 1分あたり10リクエスト
- 一般APIエンドポイント: 1分あたり60リクエスト
- ストレージアップロード: 1日あたり100MB

## エラーハンドリング

クライアント側で以下のエラーハンドリングを実装することを推奨します：

```javascript
try {
  const { data, error } = await supabase.from('materials').select('*');
  
  if (error) {
    // エラーハンドリング
    console.error('Error fetching materials:', error.message);
    // UIにエラーメッセージを表示
  }
  
  // 正常なレスポンスの処理
} catch (e) {
  // 予期せぬエラーのハンドリング
  console.error('Unexpected error:', e);
}
```

## バージョニング

APIバージョンは現在v1のみサポートしています。将来的なバージョン更新時には、下位互換性を維持しながら、新エンドポイントにはバージョン番号を含めて提供する予定です。 