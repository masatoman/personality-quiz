'use client';

import React, { useState } from 'react';
import { FaBell, FaUserFriends, FaInfoCircle, FaCheck } from 'react-icons/fa';

// 通知の型定義
type Notification = {
  id: string;
  type: 'system' | 'activity' | 'update';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
};

const NotificationsPage: React.FC = () => {
  // 通知データの例（実際にはAPIから取得する）
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'system',
      title: 'アカウント認証完了',
      content: 'あなたのメールアドレスが正常に認証されました。',
      timestamp: '2023-10-10T10:30:00',
      isRead: false
    },
    {
      id: 'n2',
      type: 'activity',
      title: 'フィードバックの返信',
      content: 'あなたのフィードバックに対してギバー太郎さんが返信しました。',
      timestamp: '2023-10-09T15:45:00',
      isRead: false
    },
    {
      id: 'n3',
      type: 'update',
      title: '新機能のお知らせ',
      content: 'ポイント交換システムが追加されました。獲得したポイントで特典と交換できます。',
      timestamp: '2023-10-08T09:15:00',
      isRead: true
    },
    {
      id: 'n4',
      type: 'system',
      title: 'ギバースコア更新',
      content: 'あなたのギバースコアが5ポイント上昇しました。現在のスコア：65',
      timestamp: '2023-10-07T14:20:00',
      isRead: true
    },
    {
      id: 'n5',
      type: 'activity',
      title: '教材がお気に入りに追加されました',
      content: 'あなたの教材「ビジネス英語：互恵的関係の構築」がマッチャー花子さんにお気に入り登録されました。',
      timestamp: '2023-10-06T11:05:00',
      isRead: true
    },
    {
      id: 'n6',
      type: 'update',
      title: 'メンテナンスのお知らせ',
      content: '10月15日の午前2時から4時までシステムメンテナンスを実施します。',
      timestamp: '2023-10-05T08:30:00',
      isRead: true
    },
  ]);

  // 現在選択されているタブの状態
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'activity' | 'update'>('all');

  // タブによる通知のフィルタリング
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    return notification.type === activeTab;
  });

  // 通知を既読にする処理
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // すべての通知を既読にする処理
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // 未読の通知数をカウント
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          通知 
          {unreadCount > 0 && (
            <span className="ml-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
              {unreadCount}件の未読
            </span>
          )}
        </h1>
        <button 
          onClick={markAllAsRead}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaCheck className="mr-1" /> すべて既読にする
        </button>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          すべて
        </button>
        <button 
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'system' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('system')}
        >
          <FaBell className="mr-2" /> システム
        </button>
        <button 
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('activity')}
        >
          <FaUserFriends className="mr-2" /> アクティビティ
        </button>
        <button 
          className={`py-2 px-4 font-medium flex items-center ${activeTab === 'update' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('update')}
        >
          <FaInfoCircle className="mr-2" /> 更新情報
        </button>
      </div>

      {/* 通知リスト */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="mr-4">
                  {notification.type === 'system' && <FaBell className="text-blue-500" size={20} />}
                  {notification.type === 'activity' && <FaUserFriends className="text-green-500" size={20} />}
                  {notification.type === 'update' && <FaInfoCircle className="text-purple-500" size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${notification.isRead ? 'text-gray-800' : 'text-blue-800'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.timestamp).toLocaleDateString('ja-JP', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{notification.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaBell className="mx-auto text-gray-300" size={48} />
            <p className="mt-4 text-gray-500">通知はありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 