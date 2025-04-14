import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualizedListProps<T> {
  data: T[];
  rowHeight: number;
  overscan?: number;
  renderItem: (item: T) => React.ReactNode;
}

export function VirtualizedList<T>({
  data,
  rowHeight,
  overscan = 3,
  renderItem
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const getVisibleRange = useCallback(() => {
    if (!containerRef.current) return { start: 0, end: 10 };

    const { scrollTop, clientHeight } = containerRef.current;
    const start = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(clientHeight / rowHeight);
    const end = start + visibleCount + overscan;

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(data.length, end + overscan)
    };
  }, [rowHeight, overscan, data.length]);

  const handleScroll = useCallback(() => {
    setVisibleRange(getVisibleRange());
  }, [getVisibleRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const totalHeight = data.length * rowHeight;
  const visibleData = data.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * rowHeight;

  return (
    <div
      ref={containerRef}
      className="h-[400px] overflow-auto"
      style={{ position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleData.map(renderItem)}
        </div>
      </div>
    </div>
  );
} 