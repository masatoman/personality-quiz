import React, { useState } from 'react';
import { useProfile, ProfileSettings } from '@/hooks/useProfile';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
  // 通知種別
  activity_updates: boolean;
  learning_reminders: boolean;
  achievement_alerts: boolean;
  feedback_notifications: boolean;
  community_updates: boolean;
  
  // 通知チャンネル
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  
  // 通知頻度
  notification_frequency: 'daily' | 'weekly' | 'monthly';
  
  // 通知時間帯
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  // 重要度フィルター
  minimum_importance: 'all' | 'medium' | 'high' | 'critical';
}

const NotificationSettings: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    // デフォルト値の設定
    activity_updates: true,
    learning_reminders: true,
    achievement_alerts: true,
    feedback_notifications: true,
    community_updates: true,
    
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    
    notification_frequency: 'daily',
    
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    
    minimum_importance: 'all'
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        display_name: profile?.display_name || '',
        settings: preferences
      });
      toast.success('通知設定を更新しました');
    } catch (error) {
      toast.error('通知設定の更新に失敗しました');
      console.error('Notification settings update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 通知種別セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">通知の種類</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {[
            { id: 'activity_updates', label: 'アクティビティ更新' },
            { id: 'learning_reminders', label: '学習リマインダー' },
            { id: 'achievement_alerts', label: '達成通知' },
            { id: 'feedback_notifications', label: 'フィードバック通知' },
            { id: 'community_updates', label: 'コミュニティ更新' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <label htmlFor={item.id} className="text-gray-700">
                {item.label}
              </label>
              <input
                type="checkbox"
                id={item.id}
                name={item.id}
                checked={preferences[item.id as keyof NotificationPreferences] as boolean}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 通知チャンネルセクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">通知方法</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {[
            { id: 'email_notifications', label: 'メール通知' },
            { id: 'push_notifications', label: 'プッシュ通知' },
            { id: 'in_app_notifications', label: 'アプリ内通知' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <label htmlFor={item.id} className="text-gray-700">
                {item.label}
              </label>
              <input
                type="checkbox"
                id={item.id}
                name={item.id}
                checked={preferences[item.id as keyof NotificationPreferences] as boolean}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 通知頻度セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">通知頻度</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label htmlFor="notification_frequency" className="block text-sm font-medium text-gray-700">
              更新頻度
            </label>
            <select
              id="notification_frequency"
              name="notification_frequency"
              value={preferences.notification_frequency}
              onChange={handleSelectChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="daily">1日1回</option>
              <option value="weekly">週1回</option>
              <option value="monthly">月1回</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quiet_hours_start" className="block text-sm font-medium text-gray-700">
                非通知時間帯（開始）
              </label>
              <input
                type="time"
                id="quiet_hours_start"
                name="quiet_hours_start"
                value={preferences.quiet_hours_start}
                onChange={handleTimeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="quiet_hours_end" className="block text-sm font-medium text-gray-700">
                非通知時間帯（終了）
              </label>
              <input
                type="time"
                id="quiet_hours_end"
                name="quiet_hours_end"
                value={preferences.quiet_hours_end}
                onChange={handleTimeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 重要度フィルターセクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">通知フィルター</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="minimum_importance" className="block text-sm font-medium text-gray-700">
              最小重要度
            </label>
            <select
              id="minimum_importance"
              name="minimum_importance"
              value={preferences.minimum_importance}
              onChange={handleSelectChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">すべての通知</option>
              <option value="medium">中要度以上</option>
              <option value="high">高要度のみ</option>
              <option value="critical">重要な通知のみ</option>
            </select>
          </div>
        </div>
      </section>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '更新中...' : '設定を保存'}
        </button>
      </div>
    </form>
  );
};

export default NotificationSettings; 