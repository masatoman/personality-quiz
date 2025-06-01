import React from 'react';
import { motion } from 'framer-motion';
import ActivitySummary from './ActivitySummary';
import GiverScoreChart from './GiverScoreChart';
import ActivityPieChart from './ActivityPieChart';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const { data, error, loading } = useDashboardData(userId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">マイダッシュボード</h1>
      
      {/* 活動サマリー */}
      <section className="mb-8">
        <ActivitySummary
          createdMaterials={data.summary.createdMaterials}
          earnedPoints={data.summary.earnedPoints}
          viewedMaterials={data.summary.viewedMaterials}
        />
      </section>

      {/* チャートグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ギバースコア推移 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">ギバースコア推移</h2>
          <GiverScoreChart userId={userId} />
        </motion.div>

        {/* 活動種類別グラフ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">活動種類別</h2>
          <ActivityPieChart data={data.activityDistribution} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 