import React from 'react';

/* eslint-disable @typescript-eslint/no-unused-vars */

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

/**
 * スクリーンリーダー専用コンポーネント
 * 視覚的には表示されないが、スクリーンリーダーでは読み上げられる
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as: Component = 'span',
  className = ''
}) => {
  return (
    <Component className={`sr-only ${className}`}>
      {children}
    </Component>
  );
};

export default ScreenReaderOnly;
