'use client';

import React from 'react';
import { CreatorProvider } from '@/contexts/CreatorContext';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorProvider>
      <main className="min-h-screen pt-16 bg-gray-50">
        {children}
      </main>
    </CreatorProvider>
  );
} 