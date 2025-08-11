import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * メインコンテンツへのスキップリンク
 * スクリーンリーダーユーザーがナビゲーションを飛ばしてメインコンテンツに直接移動できる
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className = '' 
}) => {
  return (
    <a
      href={href}
      className={`sr-only-focusable fixed top-0 left-0 z-50 px-4 py-2 bg-blue-600 text-white rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </a>
  );
};

export default SkipLink;
