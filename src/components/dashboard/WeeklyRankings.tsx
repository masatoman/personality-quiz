import React, { useEffect, useState } from 'react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

type RankingUser = {
  id: string;
  username: string;
  score: number;
  rank: number;
  activityCount: number;
  lastActive: string;
};

type RankingResponse = {
  data: RankingUser[];
  timestamp: string;
  status: 'success' | 'empty' | 'error';
  totalUsers?: number;
  message?: string;
  error?: string;
  details?: string;
};

const WeeklyRankings: React.FC = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/rankings/weekly');
        const data: RankingResponse = await response.json();

        if (data.status === 'success') {
          setRankings(data.data);
        } else if (data.status === 'empty') {
          setRankings([]);
        } else {
          throw new Error(data.error || 'ランキングの取得に失敗しました');
        }
      } catch (error) {
        console.error('ランキングの取得中にエラーが発生しました:', error);
        setError(error instanceof Error ? error.message : 'ランキングの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
    // 5分ごとに更新
    const interval = setInterval(fetchRankings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">週間ランキング</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">週間ランキング</h2>
        <div className="text-red-500 text-center p-4">
          {error}
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">週間ランキング</h2>
        <div className="text-gray-500 text-center p-4">
          まだランキングデータがありません
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-400 text-xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-xl" />;
      case 3:
        return <FaAward className="text-amber-600 text-xl" />;
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">週間ランキング</h2>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動数</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終活動</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(user.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.score}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.activityCount}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(user.lastActive)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyRankings; 