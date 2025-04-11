import { GIVER_IMPACT } from '../../types/activity';
import { ActivityType } from '../../types/activity';

// ギバースコア計算テスト用に単純化した実装
function calculateGiverScoreIncrement(activityType: ActivityType, basePoints: number): number {
  const impact = GIVER_IMPACT[activityType] || 0;
  return Math.round(basePoints * impact);
}

describe('ギバースコア計算', () => {
  // ポイントの基本設定（仮定）
  const ACTIVITY_POINTS = {
    CREATE_CONTENT: 10,
    PROVIDE_FEEDBACK: 5,
    CONSUME_CONTENT: 1,
    SHARE_RESOURCE: 3,
    ASK_QUESTION: 2,
    COMPLETE_QUIZ: 5
  };

  it('コンテンツ作成は100%のギバースコアインパクトを持つ', () => {
    const activityType: ActivityType = 'CREATE_CONTENT';
    const basePoints = ACTIVITY_POINTS[activityType];
    const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
    
    // 100%反映なので、ベースポイントと同じ値になるはず
    expect(scoreIncrement).toBe(basePoints);
    expect(GIVER_IMPACT[activityType]).toBe(1.0);
  });

  it('フィードバック提供は80%のギバースコアインパクトを持つ', () => {
    const activityType: ActivityType = 'PROVIDE_FEEDBACK';
    const basePoints = ACTIVITY_POINTS[activityType];
    const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
    
    // 80%反映なので、ベースポイント×0.8の値に近くなるはず
    expect(scoreIncrement).toBe(Math.round(basePoints * 0.8));
    expect(GIVER_IMPACT[activityType]).toBe(0.8);
  });

  it('コンテンツ消費は10%のギバースコアインパクトを持つ', () => {
    const activityType: ActivityType = 'CONSUME_CONTENT';
    const basePoints = ACTIVITY_POINTS[activityType];
    const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
    
    // 10%反映なので、ベースポイント×0.1の値に近くなるはず
    expect(scoreIncrement).toBe(Math.round(basePoints * 0.1));
    expect(GIVER_IMPACT[activityType]).toBe(0.1);
  });

  it('リソース共有は60%のギバースコアインパクトを持つ', () => {
    const activityType: ActivityType = 'SHARE_RESOURCE';
    const basePoints = ACTIVITY_POINTS[activityType];
    const scoreIncrement = calculateGiverScoreIncrement(activityType, basePoints);
    
    // 60%反映なので、ベースポイント×0.6の値に近くなるはず
    expect(scoreIncrement).toBe(Math.round(basePoints * 0.6));
    expect(GIVER_IMPACT[activityType]).toBe(0.6);
  });

  it('全てのアクティビティタイプがギバーインパクト設定を持つ', () => {
    // 全ての活動タイプに対して設定があるか確認
    const activityTypes: ActivityType[] = [
      'CREATE_CONTENT',
      'PROVIDE_FEEDBACK',
      'CONSUME_CONTENT',
      'SHARE_RESOURCE',
      'ASK_QUESTION',
      'COMPLETE_QUIZ'
    ];
    
    activityTypes.forEach(type => {
      expect(GIVER_IMPACT[type]).toBeDefined();
      expect(typeof GIVER_IMPACT[type]).toBe('number');
      expect(GIVER_IMPACT[type]).toBeGreaterThanOrEqual(0);
      expect(GIVER_IMPACT[type]).toBeLessThanOrEqual(1);
    });
  });

  it('複数アクティビティの累積スコアが正しく計算される', () => {
    const activities: ActivityType[] = [
      'CREATE_CONTENT',
      'PROVIDE_FEEDBACK',
      'CONSUME_CONTENT',
      'SHARE_RESOURCE'
    ];
    
    let totalScore = 0;
    
    activities.forEach(activity => {
      const basePoints = ACTIVITY_POINTS[activity];
      const increment = calculateGiverScoreIncrement(activity, basePoints);
      totalScore += increment;
    });
    
    // 手動計算での期待値
    const expectedScore = 
      10 * 1.0 + // CREATE_CONTENT: 10ポイント × 100%
      5 * 0.8 +  // PROVIDE_FEEDBACK: 5ポイント × 80%
      1 * 0.1 +  // CONSUME_CONTENT: 1ポイント × 10%
      3 * 0.6;   // SHARE_RESOURCE: 3ポイント × 60%
    
    expect(totalScore).toBe(Math.round(expectedScore));
  });
}); 