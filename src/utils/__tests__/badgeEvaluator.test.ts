import { BadgeEvaluator } from '../badgeEvaluator';
import { BadgeRequirement } from '@/types/badges';

describe('BadgeEvaluator', () => {
  // 標準的なカウントベースの要件テスト
  describe('evaluateRequirement - basic count requirements', () => {
    it('should return true when count requirement is met', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 5
      };
      
      const activitySummary = {
        complete_resource_count: 10
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(true);
    });
    
    it('should return false when count requirement is not met', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 10
      };
      
      const activitySummary = {
        complete_resource_count: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
    
    it('should return false when activity count is missing', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 5
      };
      
      const activitySummary = {};
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, activitySummary)).toBe(false);
    });
    
    it('should return false when activitySummary is null or undefined', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, null as any)).toBe(false);
      expect(BadgeEvaluator.evaluateRequirement(requirement, undefined as any)).toBe(false);
    });
  });
  
  // 特殊条件のテスト
  describe('evaluateRequirement - special conditions', () => {
    it('should evaluate consecutive login streak correctly', () => {
      const requirement: BadgeRequirement = {
        activityType: 'daily_login',
        count: 7,
        condition: 'consecutive'
      };
      
      // 条件を満たすケース
      const successSummary = {
        current_streak: 10
      };
      
      // 条件を満たさないケース
      const failSummary = {
        current_streak: 5
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, successSummary)).toBe(true);
      expect(BadgeEvaluator.evaluateRequirement(requirement, failSummary)).toBe(false);
    });
  });
  
  // メタデータ条件のテスト
  describe('evaluateRequirement - metadata conditions', () => {
    it('should evaluate unique categories requirement correctly', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 3,
        metadata: {
          unique_categories: true
        }
      };
      
      // 条件を満たすケース
      const successSummary = {
        unique_categories_count: 5
      };
      
      // 条件を満たさないケース
      const failSummary = {
        unique_categories_count: 2
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, successSummary)).toBe(true);
      expect(BadgeEvaluator.evaluateRequirement(requirement, failSummary)).toBe(false);
    });
    
    it('should evaluate time limit requirement correctly', () => {
      const requirement: BadgeRequirement = {
        activityType: 'complete_resource',
        count: 1,
        metadata: {
          time_limit: 600 // 10分
        }
      };
      
      // 条件を満たすケース（5分で完了）
      const successSummary = {
        complete_resource_count: 1,
        last_activity_time: 300
      };
      
      // 条件を満たさないケース（15分かかった）
      const failSummary = {
        complete_resource_count: 1,
        last_activity_time: 900
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, successSummary)).toBe(true);
      expect(BadgeEvaluator.evaluateRequirement(requirement, failSummary)).toBe(false);
    });
    
    it('should evaluate score requirement correctly', () => {
      const requirement: BadgeRequirement = {
        activityType: 'quiz_complete',
        count: 1,
        metadata: {
          score: 90
        }
      };
      
      // 条件を満たすケース（満点）
      const successSummary = {
        quiz_complete_count: 2,
        last_score: 100
      };
      
      // 条件を満たさないケース（低得点）
      const failSummary = {
        quiz_complete_count: 2,
        last_score: 80
      };
      
      expect(BadgeEvaluator.evaluateRequirement(requirement, successSummary)).toBe(true);
      expect(BadgeEvaluator.evaluateRequirement(requirement, failSummary)).toBe(false);
    });
  });
  
  // 複数要件の評価テスト
  describe('evaluateAllRequirements', () => {
    it('should return true when all requirements are met', () => {
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
    
    it('should return false when any requirement is not met', () => {
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