// バッジマスターデータ
import { FaTrophy, FaFire, FaBook, FaPencilAlt, FaComment, FaUsers, FaCertificate, FaStar } from 'react-icons/fa';
import { Badge, BadgeType } from '@/types/badges';

// バッジのマスターデータを定義
export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'progress' | 'acquiredAt'>> = {
  first_completion: {
    id: 'badge_first_completion',
    type: 'first_completion',
    name: '最初の一歩',
    description: '初めての教材を完了しました。学習の旅が始まりました！',
    iconUrl: '/badges/first_completion.svg',
    level: 'bronze',
    requirements: [
      { activityType: 'complete_resource', count: 1 }
    ],
    isSecret: false
  },
  
  learning_streak: {
    id: 'badge_learning_streak',
    type: 'learning_streak',
    name: '継続は力なり',
    description: '7日間連続で学習活動を行いました。素晴らしい習慣です！',
    iconUrl: '/badges/learning_streak.svg',
    level: 'silver',
    requirements: [
      { activityType: 'daily_login', count: 7, condition: 'consecutive' }
    ],
    isSecret: false
  },
  
  multi_completion: {
    id: 'badge_multi_completion',
    type: 'multi_completion',
    name: '知識の探究者',
    description: '10個の教材を完了しました。幅広い知識を身につけています！',
    iconUrl: '/badges/multi_completion.svg',
    level: 'silver',
    requirements: [
      { activityType: 'complete_resource', count: 10 }
    ],
    isSecret: false
  },
  
  perfect_score: {
    id: 'badge_perfect_score',
    type: 'perfect_score',
    name: '完璧主義者',
    description: 'クイズで満点を獲得しました。素晴らしい理解力です！',
    iconUrl: '/badges/perfect_score.svg',
    level: 'gold',
    requirements: [
      { activityType: 'quiz_complete', count: 1, metadata: { score: 100 } }
    ],
    isSecret: false
  },
  
  fast_learner: {
    id: 'badge_fast_learner',
    type: 'fast_learner',
    name: '速習マスター',
    description: '短時間で教材を完了しました。効率的な学習者です！',
    iconUrl: '/badges/fast_learner.svg',
    level: 'silver',
    requirements: [
      { activityType: 'complete_resource', count: 1, metadata: { time_limit: 600 } } // 10分以内
    ],
    isSecret: false
  },
  
  content_creator: {
    id: 'badge_content_creator',
    type: 'content_creator',
    name: '知識の共有者',
    description: '初めての教材を作成しました。コミュニティに貢献しています！',
    iconUrl: '/badges/content_creator.svg',
    level: 'gold',
    requirements: [
      { activityType: 'create_material', count: 1 }
    ],
    isSecret: false
  },
  
  feedback_provider: {
    id: 'badge_feedback_provider',
    type: 'feedback_provider',
    name: '建設的批評家',
    description: '5つのフィードバックを提供しました。成長を促す手助けをしています！',
    iconUrl: '/badges/feedback_provider.svg',
    level: 'silver',
    requirements: [
      { activityType: 'provide_feedback', count: 5 }
    ],
    isSecret: false
  },
  
  community_contributor: {
    id: 'badge_community_contributor',
    type: 'community_contributor',
    name: 'コミュニティの柱',
    description: '多様な方法でコミュニティに貢献しました。感謝します！',
    iconUrl: '/badges/community_contributor.svg',
    level: 'platinum',
    requirements: [
      { activityType: 'create_material', count: 3 },
      { activityType: 'provide_feedback', count: 10 },
      { activityType: 'share_resource', count: 5 }
    ],
    isSecret: false
  },
  
  diverse_learner: {
    id: 'badge_diverse_learner',
    type: 'diverse_learner',
    name: '多才な学習者',
    description: '3つ以上のカテゴリの教材を学習しました。幅広い知識を持っています！',
    iconUrl: '/badges/diverse_learner.svg',
    level: 'gold',
    requirements: [
      { activityType: 'complete_resource', count: 3, metadata: { unique_categories: true } }
    ],
    isSecret: false
  },
  
  giver_champion: {
    id: 'badge_giver_champion',
    type: 'giver_champion',
    name: 'ギバーチャンピオン',
    description: 'ギバースコアが80を超えました。真のギバー精神の持ち主です！',
    iconUrl: '/badges/giver_champion.svg',
    level: 'platinum',
    requirements: [
      { activityType: 'complete_resource', count: 20 },
      { activityType: 'create_material', count: 5 },
      { activityType: 'provide_feedback', count: 15 }
    ],
    isSecret: false
  }
};

// バッジレベルごとの色を定義
export const BADGE_LEVEL_COLORS = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-400',
  platinum: 'text-blue-500'
};

// バッジタイプごとのアイコンを定義
export const BADGE_TYPE_ICONS = {
  first_completion: FaBook,
  learning_streak: FaFire,
  multi_completion: FaTrophy,
  perfect_score: FaStar,
  fast_learner: FaCertificate,
  content_creator: FaPencilAlt,
  feedback_provider: FaComment,
  community_contributor: FaUsers,
  diverse_learner: FaBook,
  giver_champion: FaTrophy
}; 