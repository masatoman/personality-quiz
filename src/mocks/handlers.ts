import { rest } from 'msw'

// テストデータを一時的に保存するためのMap
export const testDataStore = new Map<string, string>()

// レスポンス型の定義
type SuccessResponse = {
  success: true
  message?: string
  data: {
    key: string
    value: string
  }
}

type ErrorResponse = {
  error: string
}

type ApiResponse = SuccessResponse | ErrorResponse

export const handlers = [
  // データ保存エンドポイント
  rest.post('/api/test/persistence', async (req, res, ctx) => {
    try {
      const { key, value } = await req.json()

      // バリデーション
      if (!key || typeof key !== 'string') {
        return res(
          ctx.status(400),
          ctx.json({ error: 'キーは必須で文字列である必要があります' })
        )
      }

      // データを保存
      testDataStore.set(key, value || '')

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: 'データが正常に保存されました',
          data: { key, value: value || '' }
        })
      )
    } catch (error) {
      console.error('データ保存中にエラーが発生しました:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'サーバーエラーが発生しました' })
      )
    }
  }),

  // データ取得エンドポイント
  rest.get('/api/test/persistence', async (req, res, ctx) => {
    try {
      const url = new URL(req.url)
      const key = url.searchParams.get('key')

      if (!key) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'キーパラメータは必須です' })
        )
      }

      const value = testDataStore.get(key)

      if (value === undefined) {
        return res(
          ctx.status(404),
          ctx.json({ error: '指定されたキーのデータが見つかりません' })
        )
      }

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { key, value }
        })
      )
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error)
      return res(
        ctx.status(500),
        ctx.json({ error: 'サーバーエラーが発生しました' })
      )
    }
  }),

  // その他のAPIエンドポイントのモック
  rest.get('/api/user/profile', (req, res, ctx) => {
    return rest.json(
      {
        id: 1,
        name: 'テストユーザー',
        email: 'test@example.com'
      },
      { status: 200 }
    )
  }),

  rest.get('/api/learning/progress', (req, res, ctx) => {
    return rest.json(
      {
        completedLessons: 5,
        totalLessons: 10,
        currentPoints: 100
      },
      { status: 200 }
    )
  })
] 