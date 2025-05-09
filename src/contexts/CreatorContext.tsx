'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 型定義
interface BasicInfo {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  title: string;
  content: string;
  options?: string[];
  answer?: number;
}

interface SettingsData {
  isPublic: boolean;
  allowComments: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  targetAudience: string[];
  prerequisites: string;
}

// コンテキストの型定義
interface CreatorContextType {
  basicInfo: BasicInfo;
  setBasicInfo: (data: BasicInfo) => void;
  contentSections: ContentSection[];
  setContentSections: (data: ContentSection[]) => void;
  settings: SettingsData;
  setSettings: (data: SettingsData) => void;
  resetData: () => void;
}

// デフォルト値
const defaultBasicInfo: BasicInfo = {
  title: '',
  description: '',
  tags: [],
};

const defaultSettings: SettingsData = {
  isPublic: true,
  allowComments: true,
  difficulty: 'beginner',
  estimatedTime: 30,
  targetAudience: [],
  prerequisites: '',
};

// コンテキスト作成
const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

// コンテキストプロバイダーコンポーネント
export const CreatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(defaultBasicInfo);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // データリセット関数
  const resetData = () => {
    setBasicInfo(defaultBasicInfo);
    setContentSections([]);
    setSettings(defaultSettings);
  };

  return (
    <CreatorContext.Provider value={{
      basicInfo,
      setBasicInfo,
      contentSections,
      setContentSections,
      settings,
      setSettings,
      resetData
    }}>
      {children}
    </CreatorContext.Provider>
  );
};

// カスタムフック
export const useCreator = (): CreatorContextType => {
  const context = useContext(CreatorContext);
  if (context === undefined) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
}; 