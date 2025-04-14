import React, { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebouncedCallback } from 'use-debounce';

export interface VirtualScrollContainerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height: number;
  itemHeight: number;
}

export function VirtualScrollContainer<T>({ 
  items, 
  renderItem, 
  height, 
  itemHeight 
}: VirtualScrollContainerProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // モバイルでのスクロール時のちらつき防止
  });

  // スクロール状態の監視（パフォーマンス最適化）
  const debouncedScrollEnd = useDebouncedCallback(
    () => setIsScrolling(false),
    150
  );

  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const handleScroll = () => {
      setIsScrolling(true);
      debouncedScrollEnd();
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [debouncedScrollEnd]);

  // タッチイベントの処理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setScrollVelocity(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY;
    setScrollVelocity(deltaY);

    if (parentRef.current) {
      parentRef.current.scrollTop += deltaY;
      setTouchStartY(currentY);
    }
  };

  const handleTouchEnd = () => {
    // 慣性スクロールの実装
    if (Math.abs(scrollVelocity) > 10) {
      const momentum = scrollVelocity * 0.95;
      if (parentRef.current) {
        parentRef.current.scrollTop += momentum;
      }
    }
    setScrollVelocity(0);
  };

  return (
    <div
      ref={parentRef}
      className="overflow-auto overscroll-contain"
      style={{ 
        height,
        WebkitOverflowScrolling: 'touch', // iOSでのスムーズスクロール
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
              willChange: isScrolling ? 'transform' : 'auto', // スクロール中のパフォーマンス最適化
              opacity: isScrolling ? 0.8 : 1, // スクロール中の描画負荷軽減
              transition: isScrolling ? 'none' : 'opacity 0.2s ease-out',
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
} 