import { useEffect, useCallback } from 'react';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * フォーカストラップフック
 * モーダルダイアログ内でのフォーカス管理を行う
 */
export const useFocusTrap = (isOpen: boolean, containerRef: { current: HTMLElement | null }) => {
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return (
        element instanceof HTMLElement &&
        !element.hasAttribute('disabled') &&
        !element.getAttribute('aria-hidden') &&
        element.tabIndex !== -1
      );
    }) as HTMLElement[];
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 最初の要素にフォーカス
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab（逆順）
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab（順方向）
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // ESCキーでモーダルを閉じる処理は親コンポーネントで実装
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, containerRef, getFocusableElements]);
};
