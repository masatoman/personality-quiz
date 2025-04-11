import React from 'react';
import { HiGift, HiStar, HiLightningBolt, HiUser } from 'react-icons/hi';

interface UserData {
  id: string;
  name: string;
  email: string;
  score: number;
  activities: number;
  level: number;
  nextLevelScore: number;
  progressPercentage: number;
  personalityType: 'giver' | 'taker' | 'matcher';
}

interface GiverScoreDisplayProps {
  userData: UserData;
}

// レベルごとの特典マップ（実際の実装に合わせて調整してください）
const LEVEL_BENEFITS: Record<number, string[]> = {
  1: ['基本機能の利用'],
  2: ['詳細フィードバック機能', 'ポイント2倍デー'],
  3: ['教材ブックマーク機能', 'バッジシステムのロック解除'],
  4: ['教材作成機能のロック解除', 'ギバーコミュニティへのアクセス'],
  5: ['他ユーザーのメンター登録', 'カスタムテーマ'],
  6: ['リソース提案機能', 'ギバーSNSバッジの獲得'],
  7: ['上級者向け教材の作成許可', 'プライオリティサポート'],
  8: ['ギバーリーダーボードへの参加', 'VIPイベントへの招待'],
  9: ['プラットフォームの意思決定権限', 'ギバー認定バッジ'],
  10: ['無制限の教材作成', 'マスターメンターステータス', 'ギバーTシャツの贈呈']
};

// パーソナリティタイプごとのアイコンマップ
const PERSONALITY_ICONS = {
  giver: <HiGift data-testid="giver-icon" className="text-green-500" size={24} />,
  taker: <HiStar data-testid="taker-icon" className="text-blue-500" size={24} />,
  matcher: <HiLightningBolt data-testid="matcher-icon" className="text-purple-500" size={24} />
};

// パーソナリティタイプごとの色マップ
const PERSONALITY_COLORS = {
  giver: 'bg-green-500',
  taker: 'bg-blue-500',
  matcher: 'bg-purple-500'
};

const GiverScoreDisplay: React.FC<GiverScoreDisplayProps> = ({ userData }) => {
  const { score, level, nextLevelScore, progressPercentage, personalityType, activities } = userData;
  
  // 次のレベルまでの必要ポイント
  const pointsToNextLevel = nextLevelScore - score;
  
  // 現在のレベルの特典リスト
  const currentBenefits = LEVEL_BENEFITS[level] || [];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-center mb-4">
        <div className="rounded-full bg-gray-100 p-3 mr-4">
          {PERSONALITY_ICONS[personalityType] || <HiUser size={24} />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{userData.name}</h2>
          <p className="text-gray-600">{personalityType.charAt(0).toUpperCase() + personalityType.slice(1)}タイプ</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">ギバースコア</span>
          <span className="font-bold text-xl">{score}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">レベル</span>
          <span className="font-semibold">レベル {level}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">活動数</span>
          <span className="font-semibold">{activities} 活動</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span>進捗状況</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${PERSONALITY_COLORS[personalityType]}`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          次のレベルまで: {pointsToNextLevel}ポイント
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">特典:</h3>
        <ul className="list-disc pl-5">
          {currentBenefits.map((benefit, index) => (
            <li key={index} className="text-gray-700">{benefit}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GiverScoreDisplay; 