'use client';

import React, { useState, useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaUsers, FaEye, FaEyeSlash } from 'react-icons/fa';

const DevAuthPanel: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { user, devSwitchUser, devUsers, isDevMode } = authContext;
  const [isExpanded, setIsExpanded] = useState(false);

  // 開発環境でない場合は何も表示しない
  if (!isDevMode) {
    return null;
  }

  const handleUserSwitch = async (userId: string | null) => {
    console.log('🔧 DevAuthPanel: handleUserSwitch called with userId:', userId);
    console.log('🔧 DevAuthPanel: devSwitchUser function exists:', !!devSwitchUser);
    
    if (devSwitchUser) {
      try {
        await devSwitchUser(userId);
        console.log('🔧 DevAuthPanel: devSwitchUser completed successfully');
      } catch (error) {
        console.error('🔧 DevAuthPanel: Error in devSwitchUser:', error);
      }
    } else {
      console.error('🔧 DevAuthPanel: devSwitchUser function is not available');
    }
  };

  const getCurrentUserDisplay = () => {
    if (!user) return '未ログイン';
    return user.profile?.display_name || user.username || user.email || 'ユーザー';
  };

  const getUserTypeColor = (user: any) => {
    if (!user?.profile?.personality_type) return 'bg-gray-500';
    switch (user.profile.personality_type) {
      case 'giver': return 'bg-green-500';
      case 'matcher': return 'bg-blue-500';
      case 'taker': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-slate-800 text-white rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        {/* ヘッダー（常に表示） */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <FaCog className="w-4 h-4" />
            <span className="text-sm font-medium">Dev Auth</span>
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          <button className="text-gray-300 hover:text-white">
            {isExpanded ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          </button>
        </div>

        {/* 展開時のコンテンツ */}
        {isExpanded && (
          <div className="border-t border-slate-600 p-3">
            {/* 現在のユーザー表示 */}
            <div className="mb-4">
              <div className="text-xs text-gray-300 mb-1">現在のユーザー</div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getUserTypeColor(user)}`} />
                <span className="text-sm font-medium">{getCurrentUserDisplay()}</span>
              </div>
              {user?.profile?.personality_type && (
                <div className="text-xs text-gray-400 mt-1">
                  {user.profile.personality_type} | スコア: {user.profile.giver_score} | Lv.{user.profile.level}
                </div>
              )}
            </div>

            {/* ユーザー切り替えボタン */}
            <div className="space-y-2">
              <div className="text-xs text-gray-300 mb-2 flex items-center">
                <FaUsers className="w-3 h-3 mr-1" />
                ユーザー切り替え
              </div>
              
              {/* 未ログイン状態ボタン */}
              <button
                onClick={() => handleUserSwitch(null)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  !user 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaSignOutAlt className="w-3 h-3" />
                  <span>未ログイン状態</span>
                </div>
              </button>

              {/* 各ユーザーボタン */}
              {devUsers?.map((devUser) => (
                <button
                  key={devUser.id}
                  onClick={() => handleUserSwitch(devUser.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    user?.id === devUser.id 
                      ? `${getUserTypeColor(devUser)} text-white` 
                      : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FaUser className="w-3 h-3" />
                    <div>
                      <div className="font-medium">
                        {devUser.profile?.display_name || devUser.username}
                      </div>
                      <div className="text-xs opacity-75">
                        {devUser.profile?.personality_type} | Lv.{devUser.profile?.level}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 説明 */}
            <div className="mt-4 text-xs text-gray-400 border-t border-slate-600 pt-3">
              開発環境専用パネル<br/>
              認証をスキップしてユーザーを切り替えできます
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevAuthPanel;
