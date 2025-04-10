import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaTimes, FaTrophy } from 'react-icons/fa';
import { Badge } from '@/types/badges';
import { BADGE_LEVEL_COLORS } from '@/data/badges';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  autoCloseTime?: number; // ミリ秒単位
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badge,
  onClose,
  autoCloseTime = 5000 // デフォルトは5秒
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const levelColor = BADGE_LEVEL_COLORS[badge.level] || 'text-gray-500';

  // 自動的に閉じるタイマーを設定
  useEffect(() => {
    if (!autoCloseTime) return;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (autoCloseTime / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // アニメーション完了後に完全に削除
    }, autoCloseTime);

    return () => {
      clearInterval(timer);
      clearTimeout(closeTimer);
    };
  }, [autoCloseTime, onClose]);

  // 非表示の場合は何も表示しない
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg 
                 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} 
                 overflow-hidden z-50`}
    >
      <div className="relative p-4">
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="閉じる"
        >
          <FaTimes />
        </button>
        
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            {badge.iconUrl ? (
              <Image 
                src={badge.iconUrl} 
                alt={badge.name} 
                width={48} 
                height={48} 
                className="rounded-full"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${levelColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
                <FaTrophy className={`text-2xl ${levelColor}`} />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-gray-800">バッジを獲得しました！</h3>
            <p className={`font-medium ${levelColor}`}>{badge.name}</p>
            <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
          </div>
        </div>
      </div>
      
      {/* プログレスバー */}
      <div 
        className={`h-1 ${levelColor.replace('text-', 'bg-')}`} 
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
      />
    </div>
  );
};

export default BadgeNotification; 