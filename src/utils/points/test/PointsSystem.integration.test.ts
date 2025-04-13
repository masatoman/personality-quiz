import { consumePoints, fetchPointsBalance, PURCHASABLE_ITEMS } from '../../utils/points';
import { ACTIVITY_POINTS } from '../../lib/api';
import { ActivityType } from '../../types/activity';

// APIをモック
global.fetch = jest.fn();

// テスト用にポイント計算機能を単純化した実装
const calculatePointsForActivity = (activityType: ActivityType): number => {
  return ACTIVITY_POINTS[activityType] || 0;
};

// ポイント使用処理のシミュレーション
const simulatePointsUsage = (
  availablePoints: number, 
  pointCost: number
): { success: boolean; remainingPoints: number } => {
  if (availablePoints < pointCost) {
    return { success: false, remainingPoints: availablePoints };
  }
  return { success: true, remainingPoints: availablePoints - pointCost };
};

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

  // PointSystem.test.tsから統合
  describe('ポイント獲得機能', () => {
    it('教材作成では10ポイント獲得できる', () => {
      const points = calculatePointsForActivity('CREATE_CONTENT');
      expect(points).toBe(10);
    });

    it('フィードバック提供では3ポイント獲得できる', () => {
      const points = calculatePointsForActivity('PROVIDE_FEEDBACK');
      expect(points).toBe(3);
    });

    it('コンテンツ消費では1ポイント獲得できる', () => {
      const points = calculatePointsForActivity('CONSUME_CONTENT');
      expect(points).toBe(1);
    });

    it('質問投稿では1ポイント獲得できる', () => {
      const points = calculatePointsForActivity('ASK_QUESTION');
      expect(points).toBe(1);
    });

    it('複数のアクティビティによる累積ポイントが正しく計算される', () => {
      const activityTypes: ActivityType[] = [
        'CREATE_CONTENT',
        'PROVIDE_FEEDBACK',
        'CONSUME_CONTENT',
        'ASK_QUESTION'
      ];
      
      const totalPoints = activityTypes.reduce((sum, type) => {
        return sum + calculatePointsForActivity(type);
      }, 0);
      
      // 手動計算: 10 + 3 + 1 + 1 = 15
      expect(totalPoints).toBe(15);
    });

    it('未定義のアクティビティでは0ポイント獲得となる', () => {
      // @ts-ignore - テスト用に意図的に不正な値を使用
      const points = calculatePointsForActivity('INVALID_ACTIVITY');
      expect(points).toBe(0);
    });
  });

  describe('ポイント使用機能', () => {
    it('十分なポイントがある場合は使用に成功する', () => {
      const availablePoints = 100;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(true);
      expect(result.remainingPoints).toBe(50);
    });

    it('ポイントが不足している場合は使用に失敗する', () => {
      const availablePoints = 30;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(false);
      expect(result.remainingPoints).toBe(30); // 変化なし
    });

    it('ちょうどのポイント数でも使用に成功する', () => {
      const availablePoints = 50;
      const pointCost = 50;
      
      const result = simulatePointsUsage(availablePoints, pointCost);
      
      expect(result.success).toBe(true);
      expect(result.remainingPoints).toBe(0);
    });

    it('連続使用の場合、残りポイントが正確に計算される', () => {
      let currentPoints = 100;
      
      // 1回目の使用: 30ポイント
      const firstUsage = simulatePointsUsage(currentPoints, 30);
      expect(firstUsage.success).toBe(true);
      currentPoints = firstUsage.remainingPoints;
      expect(currentPoints).toBe(70);
      
      // 2回目の使用: 50ポイント
      const secondUsage = simulatePointsUsage(currentPoints, 50);
      expect(secondUsage.success).toBe(true);
      currentPoints = secondUsage.remainingPoints;
      expect(currentPoints).toBe(20);
      
      // 3回目の使用: 30ポイント（失敗するはず）
      const thirdUsage = simulatePointsUsage(currentPoints, 30);
      expect(thirdUsage.success).toBe(false);
      currentPoints = thirdUsage.remainingPoints;
      expect(currentPoints).toBe(20); // 変化なし
    });
  });
}); 