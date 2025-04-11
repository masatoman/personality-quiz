import { BadgeEvaluator } from '../badgeEvaluator';
import { BadgeRequirement } from '@/types/badges';
import { ActivityType } from '@/types/learning';

describe('BadgeEvaluator', () => {
  describe('evaluateRequirement', () => {
    it('活動回数が要件を満たしている場合trueを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 5
      };
      
      const activitySummary = {
        complete_resource_count: 10
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('活動回数が要件を満たしていない場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 10
      };
      
      const activitySummary = {
        complete_resource_count: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
    
    it('レコードに該当活動のカウントがない場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'provide_feedback',
        count: 3
      };
      
      const activitySummary = {
        complete_resource_count: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
  });
  
  describe('連続ログイン要件の評価', () => {
    it('連続ログイン日数が要件を満たしている場合trueを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'daily_login',
        count: 7,
        condition: 'consecutive'
      };
      
      const activitySummary = {
        current_streak: 10
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('連続ログイン日数が要件を満たしていない場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'daily_login',
        count: 7,
        condition: 'consecutive'
      };
      
      const activitySummary = {
        current_streak: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
  });
  
  describe('カテゴリ関連要件の評価', () => {
    it('ユニークカテゴリの完了数が要件を満たす場合trueを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 3,
        metadata: {
          unique_categories: true
        }
      };
      
      const activitySummary = {
        unique_categories_count: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('ユニークカテゴリの完了数が要件を満たさない場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 3,
        metadata: {
          unique_categories: true
        }
      };
      
      const activitySummary = {
        unique_categories_count: 2
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
  });
  
  describe('時間制限付き要件の評価', () => {
    it('指定時間内に達成した場合trueを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 1,
        metadata: {
          time_limit: 600 // 10分
        }
      };
      
      const activitySummary = {
        complete_resource_count: 1,
        last_activity_time: 300 // 5分
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('指定時間内に達成できなかった場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 1,
        metadata: {
          time_limit: 600 // 10分
        }
      };
      
      const activitySummary = {
        complete_resource_count: 1,
        last_activity_time: 900 // 15分
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
  });
  
  describe('評価結果要件の評価', () => {
    it('スコアが閾値以上の場合trueを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'quiz_complete',
        count: 1,
        metadata: {
          score: 80
        }
      };
      
      const activitySummary = {
        quiz_complete_count: 2,
        last_score: 90
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('スコアが閾値未満の場合falseを返す', () => {
      const requirement: BadgeRequirement = {
        activityType: 'quiz_complete',
        count: 1,
        metadata: {
          score: 80
        }
      };
      
      const activitySummary = {
        quiz_complete_count: 2,
        last_score: 75
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
  });
  
  describe('複数要件の評価', () => {
    it('すべての要件を満たす場合trueを返す', () => {
      const requirements: BadgeRequirement[] = [
        {
          activityType: 'complete_resource',
          count: 5
        },
        {
          activityType: 'daily_login',
          count: 7,
          condition: 'consecutive'
        }
      ];
      
      const activitySummary = {
        complete_resource_count: 10,
        current_streak: 10
      };
      
      expect(BadgeEvaluator.evaluateAllRequirements(requirements, activitySummary)).toBe(true);
    });
    
    it('一部の要件を満たさない場合falseを返す', () => {
      const requirements: BadgeRequirement[] = [
        {
          activityType: 'complete_resource',
          count: 5
        },
        {
          activityType: 'daily_login',
          count: 7,
          condition: 'consecutive'
        }
      ];
      
      const activitySummary = {
        complete_resource_count: 10,
        current_streak: 5 // この要件は満たさない
      };
      
      expect(BadgeEvaluator.evaluateAllRequirements(requirements, activitySummary)).toBe(false);
    });
  });
}); 