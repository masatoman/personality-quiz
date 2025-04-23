import React from 'react';

export default function TestUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="test-ui-layout">
      {children}
    </div>
  );
} 