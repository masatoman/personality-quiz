import React, { useState, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ProfileFormData {
  display_name: string;
  bio: string;
  avatar_url?: string;
}

const ProfileEditor: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: アバターアップロード機能の実装
    // const formData = new FormData();
    // formData.append('avatar', file);
    // const response = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
    // const { url } = await response.json();
    // setFormData(prev => ({ ...prev, avatar_url: url }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile(formData);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* アバター画像 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
            {formData.avatar_url ? (
              <Image
                src={formData.avatar_url}
                alt="プロフィール画像"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
          >
            画像を変更
          </label>
        </div>

        {/* 表示名 */}
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
            表示名
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            value={formData.display_name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* 自己紹介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '更新中...' : '更新する'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor; 