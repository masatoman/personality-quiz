import { Level } from '@/types/common';

export const LEVELS: Level[] = [
  {
    id: 1,
    number: 1,
    name: 'ビギナー',
    title: 'ビギナー',
    minPoints: 0,
    maxPoints: 99,
    requiredScore: 0,
    description: '学習の第一歩を踏み出したレベル',
    icon: '🌟',
    benefits: [
      '基本的な学習機能の利用',
      'コミュニティへのアクセス',
      '週間学習レポートの閲覧'
    ]
  },
  {
    id: 2,
    number: 2,
    name: 'アドベンチャー',
    title: 'アドベンチャー',
    minPoints: 100,
    maxPoints: 299,
    requiredScore: 100,
    description: '積極的に学習に取り組むレベル',
    icon: '🚀',
    benefits: [
      'カスタマイズ可能な学習パス',
      'プレミアム教材へのアクセス',
      '月間進捗分析レポート'
    ]
  },
  {
    id: 3,
    number: 3,
    name: 'エキスパート',
    title: 'エキスパート',
    minPoints: 300,
    maxPoints: 599,
    requiredScore: 300,
    description: '高度な学習スキルを持つレベル',
    icon: '⭐',
    benefits: [
      'AIパーソナルコーチの利用',
      'グループ学習セッションの主催',
      'プロフェッショナル認定証の取得'
    ]
  },
  {
    id: 4,
    number: 4,
    name: 'マスター',
    title: 'マスター',
    minPoints: 600,
    maxPoints: 999,
    requiredScore: 600,
    description: '学習の達人レベル',
    icon: '👑',
    benefits: [
      'メンター資格の取得',
      'コミュニティリーダー権限',
      'オリジナル学習コンテンツの作成権限'
    ]
  },
  {
    id: 5,
    number: 5,
    name: 'レジェンド',
    title: 'レジェンド',
    minPoints: 1000,
    maxPoints: 9999,
    requiredScore: 1000,
    description: '伝説的な学習者レベル',
    icon: '🏆',
    benefits: [
      'プラットフォームアンバサダー資格',
      'プライベートメンタリングセッション',
      'グローバルリーダーボード参加資格'
    ]
  }
]; 