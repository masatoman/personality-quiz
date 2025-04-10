import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

interface GiverScoreDisplayProps {
  score: number;
  showDetails?: boolean;
}

// レベルの型定義
interface GiverLevel {
  min: number;
  max: number;
  name: string;
  icon: JSX.Element;
  color: string;
}

// ギバースコアに基づくレベル定義
const GIVER_LEVELS: GiverLevel[] = [
  { min: 0, max: 10, name: '初心者ギバー', icon: <FaRegStar className="text-gray-400" />, color: 'text-gray-600' },
  { min: 11, max: 30, name: 'アクティブギバー', icon: <FaStarHalfAlt className="text-blue-400" />, color: 'text-blue-600' },
  { min: 31, max: 60, name: 'レギュラーギバー', icon: <FaStar className="text-blue-500" />, color: 'text-blue-600' },
  { min: 61, max: 100, name: 'エリートギバー', icon: <FaMedal className="text-yellow-500" />, color: 'text-yellow-600' },
  { min: 101, max: 200, name: 'マスターギバー', icon: <FaAward className="text-yellow-600" />, color: 'text-yellow-700' },
  { min: 201, max: Infinity, name: 'レジェンドギバー', icon: <FaTrophy className="text-yellow-500" />, color: 'text-yellow-700' }
];

const GiverScoreDisplay: React.FC<GiverScoreDisplayProps> = ({ 
  score,
  showDetails = true
}) => {
  const [level, setLevel] = useState<GiverLevel>(GIVER_LEVELS[0]);
  const [nextLevel, setNextLevel] = useState<GiverLevel | null>(GIVER_LEVELS[1]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // スコアに基づいてレベルを決定
    const currentLevel = GIVER_LEVELS.reduce((prev, current) => {
      return (score >= current.min && score <= current.max) ? current : prev;
    }, GIVER_LEVELS[0]);
    
    setLevel(currentLevel);
    
    // 次のレベルを計算
    const currentIndex = GIVER_LEVELS.findIndex(l => l === currentLevel);
    const next = currentIndex < GIVER_LEVELS.length - 1 ? GIVER_LEVELS[currentIndex + 1] : null;
    setNextLevel(next);
    
    // 進捗度を計算
    if (next) {
      const levelRange = next.min - currentLevel.min;
      const userProgress = score - currentLevel.min;
      setProgress(Math.min(100, Math.round((userProgress / levelRange) * 100)));
    } else {
      setProgress(100); // 最高レベルの場合
    }
  }, [score]);

  return (
    <div className="giver-score-display bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-3 text-2xl">{level.icon}</div>
          <div>
            <h3 className={`text-lg font-bold ${level.color}`}>{level.name}</h3>
            <p className="text-sm text-gray-600">ギバースコア: {score}点</p>
          </div>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-xs text-gray-500">次のレベルまで</p>
            <p className="text-sm font-semibold">{nextLevel.min - score}点</p>
          </div>
        )}
      </div>
      
      {/* プログレスバー */}
      <div className="relative h-2 bg-gray-200 rounded overflow-hidden mb-4">
        <div 
          className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="mt-4 text-sm">
          <h4 className="font-semibold mb-2">ギバースコアとは？</h4>
          <p className="text-gray-600 mb-2">
            コミュニティへの貢献度を表す指標です。教材作成やフィードバック提供など、
            他のユーザーの学習を助ける行動によってスコアが上昇します。
          </p>
          <h4 className="font-semibold mb-2">{level.name}の特典</h4>
          <ul className="list-disc list-inside text-gray-600">
            {getLevelBenefits(level.name).map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// レベルごとの特典を取得
function getLevelBenefits(levelName: string): string[] {
  switch(levelName) {
    case '初心者ギバー':
      return [
        'ベーシックコンテンツへのアクセス',
        '基本フィードバック機能'
      ];
    case 'アクティブギバー':
      return [
        'ベーシックコンテンツへのアクセス',
        '基本フィードバック機能',
        'コミュニティバッジの獲得'
      ];
    case 'レギュラーギバー':
      return [
        '全コンテンツへのアクセス',
        '高度なフィードバック機能',
        'コミュニティバッジの獲得',
        'プレミアム教材の割引'
      ];
    case 'エリートギバー':
      return [
        '全コンテンツへのアクセス',
        '高度なフィードバック機能',
        'エリートバッジの獲得',
        'プレミアム教材の割引',
        'コンテンツの収益化機能'
      ];
    case 'マスターギバー':
      return [
        '全コンテンツへのフルアクセス',
        '最高度なフィードバック機能',
        'マスターバッジの獲得',
        'プレミアム教材の大幅割引',
        'コンテンツの収益化機能',
        'メンター認定資格'
      ];
    case 'レジェンドギバー':
      return [
        '全コンテンツへのフルアクセス',
        '最高度なフィードバック機能',
        'レジェンドバッジの獲得',
        'プレミアム教材の無料アクセス',
        'コンテンツの収益化機能（高率）',
        'メンター認定資格',
        'プラットフォーム開発への参加権'
      ];
    default:
      return ['基本機能へのアクセス'];
  }
}

export default GiverScoreDisplay; 