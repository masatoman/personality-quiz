import { consumePoints, fetchPointsBalance, PURCHASABLE_ITEMS } from '../../utils/points';

// APIをモック
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
      
      // 成功レスポンスが返されるか検証
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
          error: 'ポイントが不足しています',
          currentPoints: 50,
          requiredPoints: 100
        })
      });
      
      // ポイント消費関数を実行
      const result = await consumePoints(100, 'purchase_item');
      
      // エラーレスポンスが返されるか検証
      expect(result).toEqual({
        success: false,
        error: 'ポイントが不足しています',
        currentPoints: 50,
        requiredPoints: 100
      });
    });
    
    it('通信エラーの場合、エラーレスポンスを返す', async () => {
      // フェッチ関数がエラーをスローする場合
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // ポイント消費関数を実行
      const result = await consumePoints(100, 'purchase_item');
      
      // エラーレスポンスが返されるか検証
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
      
      // 成功レスポンスが返されるか検証
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
      
      // エラーレスポンスが返されるか検証
      expect(result).toEqual({
        success: false,
        error: '認証が必要です'
      });
    });
  });
  
  describe('購入可能アイテム', () => {
    it('購入可能アイテムのリストが正しく定義されている', () => {
      // 購入可能アイテムリストが配列として存在するか検証
      expect(Array.isArray(PURCHASABLE_ITEMS)).toBe(true);
      
      // 少なくとも1つのアイテムが存在するか検証
      expect(PURCHASABLE_ITEMS.length).toBeGreaterThan(0);
      
      // 各アイテムが必要なプロパティを持っているか検証
      PURCHASABLE_ITEMS.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('points');
        expect(item).toHaveProperty('category');
        
        // ポイントは数値であるか検証
        expect(typeof item.points).toBe('number');
        expect(item.points).toBeGreaterThan(0);
      });
    });
  });
}); 