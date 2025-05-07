/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import React, { memo, useCallback, useState, useTransition } from 'react';
import { FixedSizeList as List } from 'react-window';
import { twMerge } from 'tailwind-merge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { RankingItem } from './RankingItem';
import type { RankingData } from '@/types';

interface WeeklyRankingsProps {
  rankings: RankingData[];
  isLoading?: boolean;
  onRetry?: () => void;
}

// 仮想化リストの設定
const ITEM_SIZE = 72; // 各ランキングアイテムの高さ
const WINDOW_HEIGHT = 600; // リストの表示高さ

function WeeklyRankingsBase({
  rankings,
  isLoading = false,
  onRetry
}: WeeklyRankingsProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isScrolling) {
      setIsScrolling(true);
    }
    // スクロール停止後200msでisScrollingをfalseに戻す
    clearTimeout((handleScroll as any).timeoutId);
    (handleScroll as any).timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, 200);
  }, [isScrolling]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingState showText text="ランキングを読み込み中..." />
      </div>
    );
  }

  if (!rankings?.length) {
    return (
      <EmptyState
        title="ランキングデータがありません"
        description="まだ活動データが登録されていません。"
        action={onRetry ? {
          label: '再読み込み',
          onClick: () => startTransition(() => onRetry())
        } : undefined}
      />
    );
  }

  // 仮想化リストのレンダリング関数
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const ranking = rankings[index];
    return (
      <div style={style}>
        <RankingItem
          key={ranking.id}
          {...ranking}
          isScrolling={isScrolling}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <List
        height={WINDOW_HEIGHT}
        itemCount={rankings.length}
        itemSize={ITEM_SIZE}
        width="100%"
        onScroll={handleScroll}
      >
        {Row}
      </List>
    </div>
  );
}

export const WeeklyRankings = memo(WeeklyRankingsBase);

// 開発時のコンポーネント識別用
if (process.env.NODE_ENV === 'development') {
  WeeklyRankings.displayName = 'WeeklyRankings';
} 