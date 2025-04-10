import { Level } from '@/types/quiz';

export const LEVELS: Level[] = [
  {
    number: 1,
    title: 'ビギナー',
    requiredScore: 0,
    benefits: [
      '基本的な学習機能の利用',
      'コミュニティへのアクセス',
      '週間学習レポートの閲覧'
    ]
  },
  {
    number: 2,
    title: 'アドベンチャー',
    requiredScore: 100,
    benefits: [
      'カスタマイズ可能な学習パス',
      'プレミアム教材へのアクセス',
      '月間進捗分析レポート'
    ]
  },
  {
    number: 3,
    title: 'エキスパート',
    requiredScore: 300,
    benefits: [
      'AIパーソナルコーチの利用',
      'グループ学習セッションの主催',
      'プロフェッショナル認定証の取得'
    ]
  },
  {
    number: 4,
    title: 'マスター',
    requiredScore: 600,
    benefits: [
      'メンター資格の取得',
      'コミュニティリーダー権限',
      'オリジナル学習コンテンツの作成権限'
    ]
  },
  {
    number: 5,
    title: 'レジェンド',
    requiredScore: 1000,
    benefits: [
      'プラットフォームアンバサダー資格',
      'プライベートメンタリングセッション',
      'グローバルリーダーボード参加資格'
    ]
  }
]; 