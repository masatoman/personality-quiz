import React from 'react';
import { Metadata } from 'next';
import ProfileClient from '@/components/ProfileClient';

export const metadata: Metadata = {
  title: 'プロフィール | ギバースコアと活動履歴',
  description: 'あなたのギバースコアと学習活動の履歴を確認できます。コミュニティへの貢献度とレベルアップに必要なアクションを見てみましょう。',
};

export default function ProfilePage() {
  return <ProfileClient />;
} 