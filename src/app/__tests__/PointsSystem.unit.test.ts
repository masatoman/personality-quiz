import { consumePoints, fetchPointsBalance } from '../../utils/points';

// モック関数をセットアップ
global.fetch = jest.fn();

describe('ポイントシステム', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('ポイント消費関数', () => {
    it('ポイント消費に成功した場合、成功レスポンスを返す', async () => {
      // モックレスポンスを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          consumedPoints: 100,
          remainingPoints: 400
        })
      });
      
      // ポイント消費関数を実行
      const result = await consumePoints(100, 'purchase_item', {
        referenceId: 'item_1',
        referenceType: 'item',
        description: 'アイテム購入'
      });
      
      // 正しいエンドポイントとパラメータでAPIが呼び出されているか検証
      expect(global.fetch).toHaveBeenCalledWith('/api/points/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: 100,
          actionType: 'purchase_item',
          referenceId: 'item_1',
          referenceType: 'item',
          description: 'アイテム購入'
        }),
      });
      
      // 成功レスポンスが正しく返されているか検証
      expect(result).toEqual({
        success: true,
        consumedPoints: 100,
        remainingPoints: 400
      });
    });

    it('ポイント不足の場合、エラーレスポンスを返す', async () => {
      // モックレスポンスを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'ポイント不足です',
          currentPoints: 50,
          requiredPoints: 100
        })
      });
      
      // ポイント消費関数を実行
      const result = await consumePoints(100, 'purchase_item');
      
      // エラーレスポンスが正しく返されているか検証
      expect(result).toEqual({
        success: false,
        error: 'ポイント不足です',
        currentPoints: 50,
        requiredPoints: 100
      });
    });

    it('通信エラーの場合、エラーレスポンスを返す', async () => {
      // モックレスポンスを設定
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // ポイント消費関数を実行
      const result = await consumePoints(100, 'purchase_item');
      
      // エラーレスポンスが正しく返されているか検証
      expect(result).toEqual({
        success: false,
        error: '通信エラーが発生しました'
      });
    });
  });

  describe('ポイント残高取得関数', () => {
    it('ポイント残高取得に成功した場合、成功レスポンスを返す', async () => {
      // モックレスポンスを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          points: 500
        })
      });
      
      // ポイント残高取得関数を実行
      const result = await fetchPointsBalance();
      
      // 正しいエンドポイントでAPIが呼び出されているか検証
      expect(global.fetch).toHaveBeenCalledWith('/api/points/balance');
      
      // 成功レスポンスが正しく返されているか検証
      expect(result).toEqual({
        success: true,
        points: 500
      });
    });

    it('認証エラーの場合、エラーレスポンスを返す', async () => {
      // モックレスポンスを設定
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: '認証が必要です'
        })
      });
      
      // ポイント残高取得関数を実行
      const result = await fetchPointsBalance();
      
      // エラーレスポンスが正しく返されているか検証
      expect(result).toEqual({
        success: false,
        error: '認証が必要です'
      });
    });
  });
}); 