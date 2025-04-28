import React, { useEffect, useState } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import LoadingState from '@/components/common/molecules/LoadingState';
import EmptyState from '@/components/common/molecules/EmptyState';
import Image from 'next/image';

interface RankingData {
  userId: string;
  username: string;
  score: number;
  rank: number;
  avatarUrl?: string;
}

interface WeeklyRankingsProps {
  userId: string;
}

const WeeklyRankings: React.FC<WeeklyRankingsProps> = ({ userId }) => {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/rankings/weekly');
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      const data = await response.json();
      setRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">週間ランキング</h2>
        <LoadingState 
          variant="spinner"
          size="md"
          text="ランキングを読み込み中..."
          showText={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">週間ランキング</h2>
        <EmptyState 
          title="エラーが発生しました"
          message={error}
          variant="card"
          icon={FaTrophy}
          action={{
            label: "再試行",
            onClick: fetchRankings
          }}
        />
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">週間ランキング</h2>
        <EmptyState
          title="データなし"
          message="まだランキングデータがありません"
          variant="card"
          icon={FaTrophy}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">週間ランキング</h2>
      <div className="space-y-4">
        {rankings.map((ranking) => (
          <div
            key={ranking.userId}
            className={`flex items-center p-3 rounded-lg ${
              ranking.userId === userId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              {ranking.rank === 1 ? (
                <FaTrophy className="text-yellow-400 text-2xl" />
              ) : ranking.rank === 2 ? (
                <FaMedal className="text-gray-400 text-2xl" />
              ) : ranking.rank === 3 ? (
                <FaMedal className="text-amber-600 text-2xl" />
              ) : (
                <span className="text-lg font-bold text-gray-500">{ranking.rank}</span>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center">
                {ranking.avatarUrl && (
                  <Image
                    src={ranking.avatarUrl}
                    alt={`${ranking.username}のアバター`}
                    width={40}
                    height={40}
                    className="rounded-full mr-2"
                  />
                )}
                <span className="font-medium">{ranking.username}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="font-bold text-blue-600">{ranking.score}点</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyRankings; 