import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PointHistoryItem } from '@/types/quiz';

interface PointsHistoryListProps {
  limit?: number;
  showFilters?: boolean;
}

const actionTypeLabels: Record<string, string> = {
  'create_post': '投稿作成',
  'create_comment': 'コメント投稿',
  'give_like': 'いいね付与',
  'receive_like': 'いいね受取',
  'complete_resource': '教材完了',
  'complete_quiz': 'クイズ完了',
  'exchange_reward': '報酬交換',
  'admin_grant': '管理者付与',
};

const PointsHistoryList: React.FC<PointsHistoryListProps> = ({ 
  limit = 10,
  showFilters = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedActionType, setSelectedActionType] = useState<string>('');
  
  const fetchHistory = async (page: number = 1, actionType: string = '') => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/api/points/history?limit=${limit}&offset=${offset}`;
      
      if (actionType) {
        url += `&actionType=${actionType}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('履歴の取得に失敗しました');
      }
      
      const data = await response.json();
      
      setHistory(data.points || []);
      setTotalPoints(data.totalPoints || 0);
      setTotalItems(data.count || 0);
    } catch (error) {
      console.error('ポイント履歴取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchHistory(newPage, selectedActionType);
  };
  
  const handleFilterChange = (actionType: string) => {
    setSelectedActionType(actionType);
    setCurrentPage(1);
    fetchHistory(1, actionType);
  };
  
  useEffect(() => {
    fetchHistory(currentPage, selectedActionType);
  }, []);
  
  // 一意のアクションタイプを取得
  const uniqueActionTypes = Array.from(
    new Set(history.map(item => item.actionType))
  );
  
  // 総ページ数を計算
  const totalPages = Math.ceil(totalItems / limit);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          ポイント履歴
        </h2>
        <div className="mt-2 md:mt-0 text-right">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            現在の保有ポイント:
            <span className="ml-1 font-bold text-lg text-blue-600 dark:text-blue-400">
              {totalPoints}
            </span>
          </p>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-4">
          <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            アクション種別でフィルタ
          </label>
          <select
            id="actionType"
            value={selectedActionType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">すべて表示</option>
            {uniqueActionTypes.map((type) => (
              <option key={type} value={type}>
                {actionTypeLabels[type] || type}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          ポイント履歴がありません
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    アクション
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    説明
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ポイント
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(item.createdAt.toString())}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {actionTypeLabels[item.actionType] || item.actionType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.description || '-'}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                      item.points > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {item.points > 0 ? `+${item.points}` : item.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  前へ
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  次へ
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PointsHistoryList; 