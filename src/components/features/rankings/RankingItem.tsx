import { memo } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { RankingData } from '@/types';

interface RankingItemProps extends RankingData {
  isScrolling?: boolean;
}

function RankingItemBase({
  rank,
  username,
  score,
  activityCount,
  lastActive,
  isScrolling = false
}: RankingItemProps) {
  // アバター画像のインデックスを計算（10種類に制限）
  const avatarIndex = rank % 10;
  
  // スクロール中は日付のフォーマットをスキップ
  const formattedDate = isScrolling ? lastActive : formatDistanceToNow(new Date(lastActive), {
    addSuffix: true,
    locale: ja
  });

  return (
    <div className="flex items-center p-4 gap-4 transition-colors hover:bg-gray-50">
      <div className="flex-shrink-0 w-12 text-center">
        <span className="text-lg font-semibold text-gray-700">
          {rank}
        </span>
      </div>
      
      <div className="flex-shrink-0">
        <Image
          src={`/avatars/avatar-${avatarIndex}.png`}
          alt={username}
          width={40}
          height={40}
          className="rounded-full"
          loading={rank <= 3 ? 'eager' : 'lazy'}
          priority={rank <= 3}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          sizes="40px"
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-base font-medium text-gray-900 truncate">
          {username}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{score}ポイント</span>
          <span>•</span>
          <span>{activityCount}件の活動</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

export const RankingItem = memo(RankingItemBase);

// 開発時のコンポーネント識別用
if (process.env.NODE_ENV === 'development') {
  RankingItem.displayName = 'RankingItem';
} 