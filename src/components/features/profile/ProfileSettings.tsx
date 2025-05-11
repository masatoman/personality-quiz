import React, { useState } from 'react';
import { useProfile, ProfileSettings as ProfileSettingsType } from '@/hooks/useProfile';
import { toast } from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
  const { updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfileSettingsType>({
    email_notifications: true,
    push_notifications: true,
    notification_frequency: 'daily',
    profile_visibility: 'public',
    activity_visibility: 'public',
    learning_history_visibility: 'friends',
    preferred_learning_time: '09:00',
    daily_goal_minutes: 30,
    preferred_content_type: ['text', 'video']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentTypeChange = (type: 'text' | 'video' | 'audio' | 'interactive') => {
    setFormData(prev => {
      const types = prev.preferred_content_type;
      if (types.includes(type)) {
        return {
          ...prev,
          preferred_content_type: types.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          preferred_content_type: [...types, type]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile(formData);
      toast.success('設定を更新しました');
    } catch (error) {
      toast.error('設定の更新に失敗しました');
      console.error('Settings update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 通知設定セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">通知設定</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <label htmlFor="email_notifications" className="text-gray-700">
              メール通知
            </label>
            <input
              type="checkbox"
              id="email_notifications"
              name="email_notifications"
              checked={formData.email_notifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="push_notifications" className="text-gray-700">
              プッシュ通知
            </label>
            <input
              type="checkbox"
              id="push_notifications"
              name="push_notifications"
              checked={formData.push_notifications}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
            />
          </div>

          <div>
            <label htmlFor="notification_frequency" className="block text-sm font-medium text-gray-700">
              通知頻度
            </label>
            <select
              id="notification_frequency"
              name="notification_frequency"
              value={formData.notification_frequency}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="daily">毎日</option>
              <option value="weekly">週1回</option>
              <option value="monthly">月1回</option>
            </select>
          </div>
        </div>
      </section>

      {/* プライバシー設定セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">プライバシー設定</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700">
              プロフィール公開範囲
            </label>
            <select
              id="profile_visibility"
              name="profile_visibility"
              value={formData.profile_visibility}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="public">全員に公開</option>
              <option value="friends">フレンドのみ</option>
              <option value="private">非公開</option>
            </select>
          </div>

          <div>
            <label htmlFor="activity_visibility" className="block text-sm font-medium text-gray-700">
              アクティビティ公開範囲
            </label>
            <select
              id="activity_visibility"
              name="activity_visibility"
              value={formData.activity_visibility}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="public">全員に公開</option>
              <option value="friends">フレンドのみ</option>
              <option value="private">非公開</option>
            </select>
          </div>

          <div>
            <label htmlFor="learning_history_visibility" className="block text-sm font-medium text-gray-700">
              学習履歴公開範囲
            </label>
            <select
              id="learning_history_visibility"
              name="learning_history_visibility"
              value={formData.learning_history_visibility}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="public">全員に公開</option>
              <option value="friends">フレンドのみ</option>
              <option value="private">非公開</option>
            </select>
          </div>
        </div>
      </section>

      {/* 学習設定セクション */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">学習設定</h2>
        <div className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="preferred_learning_time" className="block text-sm font-medium text-gray-700">
              希望学習時間
            </label>
            <input
              type="time"
              id="preferred_learning_time"
              name="preferred_learning_time"
              value={formData.preferred_learning_time}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="daily_goal_minutes" className="block text-sm font-medium text-gray-700">
              1日の目標学習時間（分）
            </label>
            <input
              type="number"
              id="daily_goal_minutes"
              name="daily_goal_minutes"
              min="5"
              max="480"
              value={formData.daily_goal_minutes}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望コンテンツタイプ
            </label>
            <div className="space-y-2">
              {[
                { id: 'text', label: 'テキスト' },
                { id: 'video', label: '動画' },
                { id: 'audio', label: '音声' },
                { id: 'interactive', label: 'インタラクティブ' }
              ].map(type => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`content_type_${type.id}`}
                    checked={formData.preferred_content_type.includes(type.id as any)}
                    onChange={() => handleContentTypeChange(type.id as any)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <label htmlFor={`content_type_${type.id}`} className="ml-2 text-gray-700">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
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

export default ProfileSettings; 