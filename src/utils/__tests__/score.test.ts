import { 
  calculateTimeDecay, 
  calculateScoreChange, 
  recalculateScores, 
  determinePersonalityType,
  calculateGiverLevel,
  calculateProgress
} from '../score';
import { ActivityType, MaterialType } from '@/types/quiz';

describe('Score calculation utility functions', () => {
  describe('calculateTimeDecay', () => {
    test('時間経過なしの場合は減衰なし（1.0）', () => {
      expect(calculateTimeDecay(0)).toBeCloseTo(1.0);
    });

    test('30日経過の場合は約50%に減衰', () => {
      expect(calculateTimeDecay(30)).toBeCloseTo(0.5, 1);
    });

    test('60日経過の場合は約25%に減衰', () => {
      expect(calculateTimeDecay(60)).toBeCloseTo(0.25, 1);
    });

    test('90日経過の場合は約12.5%に減衰', () => {
      expect(calculateTimeDecay(90)).toBeCloseTo(0.125, 2);
    });
  });

  describe('calculateScoreChange', () => {
    test('コンテンツ作成はgiverスコアに高い影響を与える', () => {
      const result = calculateScoreChange('CREATE_CONTENT');
      expect(result.giver).toBe(5);
      expect(result.taker).toBe(0);
      expect(result.matcher).toBe(2);
    });

    test('コンテンツ消費はtakerスコアに影響を与える', () => {
      const result = calculateScoreChange('CONSUME_CONTENT');
      expect(result.giver).toBe(0);
      expect(result.taker).toBe(2);
      expect(result.matcher).toBe(1);
    });

    test('教材タイプによって重み付けされる', () => {
      const baseResult = calculateScoreChange('CREATE_CONTENT', 'ARTICLE');
      const quizResult = calculateScoreChange('CREATE_CONTENT', 'QUIZ');
      
      // QUIZはARTICLEより高い重み付けを持つ
      expect(quizResult.giver).toBeGreaterThan(baseResult.giver);
    });

    test('時間経過によってスコアが減衰する', () => {
      const nowResult = calculateScoreChange('CREATE_CONTENT', 'ARTICLE', 0);
      const oldResult = calculateScoreChange('CREATE_CONTENT', 'ARTICLE', 30);
      
      // 30日前のアクティビティはスコアが減衰している
      expect(oldResult.giver).toBeLessThan(nowResult.giver);
    });
  });

  describe('recalculateScores', () => {
    test('複数の活動の合計スコアを計算する', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const activities = [
        { activityType: 'CREATE_CONTENT' as ActivityType, materialType: 'ARTICLE' as MaterialType, timestamp: now },
        { activityType: 'PROVIDE_FEEDBACK' as ActivityType, materialType: 'QUIZ' as MaterialType, timestamp: yesterday },
        { activityType: 'CONSUME_CONTENT' as ActivityType, materialType: 'VIDEO' as MaterialType, timestamp: lastWeek }
      ];
      
      const result = recalculateScores(activities);
      
      // 計算結果が数値である
      expect(typeof result.giver).toBe('number');
      expect(typeof result.taker).toBe('number');
      expect(typeof result.matcher).toBe('number');
      
      // createとprovideは両方giverスコアに寄与する
      expect(result.giver).toBeGreaterThan(0);
    });

    test('空の活動リストの場合はゼロを返す', () => {
      const result = recalculateScores([]);
      expect(result.giver).toBe(0);
      expect(result.taker).toBe(0);
      expect(result.matcher).toBe(0);
    });
  });

  describe('determinePersonalityType', () => {
    test('最高スコアのタイプを返す - giver', () => {
      expect(determinePersonalityType(10, 5, 3)).toBe('giver');
    });
    
    test('最高スコアのタイプを返す - taker', () => {
      expect(determinePersonalityType(5, 10, 3)).toBe('taker');
    });
    
    test('最高スコアのタイプを返す - matcher', () => {
      expect(determinePersonalityType(5, 3, 10)).toBe('matcher');
    });
    
    test('同点の場合は最初に検出されたタイプを返す', () => {
      // 同点の場合の実際の実装に合わせる
      expect(determinePersonalityType(10, 10, 10)).toBe('giver');
    });
  });

  describe('calculateGiverLevel', () => {
    test('スコア0の場合はレベル1', () => {
      expect(calculateGiverLevel(0)).toBe(1);
    });
    
    test('スコア100の場合はレベル2', () => {
      expect(calculateGiverLevel(100)).toBe(2);
    });
    
    test('スコア950の場合はレベル10', () => {
      expect(calculateGiverLevel(950)).toBe(10);
    });
    
    test('スコア1500の場合は最大レベル10に制限される', () => {
      expect(calculateGiverLevel(1500)).toBe(10);
    });
  });

  describe('calculateProgress', () => {
    test('総スコアに対する目標タイプの割合を計算する', () => {
      const scores = { giver: 60, taker: 30, matcher: 10 };
      expect(calculateProgress(scores, 'giver')).toBe(60);
    });
    
    test('すべてのスコアが0の場合は0%を返す', () => {
      const scores = { giver: 0, taker: 0, matcher: 0 };
      expect(calculateProgress(scores, 'giver')).toBe(0);
    });
  });
}); 