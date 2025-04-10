import React, { useState } from 'react';
import { useRouter } from 'next/router';
import BasicInfoStep from './BasicInfoStep';
import ContentStep from './ContentStep';
import SettingsStep from './SettingsStep';
import ConfirmStep from './ConfirmStep';

// 基本情報の型定義
interface BasicInfo {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

// コンテンツセクションの型定義
interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  title: string;
  content: string;
  options?: string[];
  answer?: number;
}

// 設定情報の型定義
interface SettingsData {
  isPublic: boolean;
  allowComments: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  targetAudience: string[];
  prerequisites: string;
}

// 標準教材作成コンポーネント
const StandardCreator: React.FC = () => {
  const router = useRouter();
  const { step } = router.query;
  
  // 各ステップのデータを管理
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: '',
    description: '',
    tags: [],
  });
  
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  
  const [settings, setSettings] = useState<SettingsData>({
    isPublic: true,
    allowComments: true,
    difficulty: 'beginner',
    estimatedTime: 30,
    targetAudience: [],
    prerequisites: '',
  });
  
  // 戻るボタンのハンドラー
  const handleBack = () => {
    switch (step) {
      case 'content':
        router.push('/create/standard/basic-info');
        break;
      case 'settings':
        router.push('/create/standard/content');
        break;
      case 'confirm':
        router.push('/create/standard/settings');
        break;
      default:
        router.push('/create');
        break;
    }
  };
  
  // 教材を公開する処理
  const handlePublish = async () => {
    try {
      // ここでAPI呼び出しを行い、教材データを保存
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          basicInfo,
          contentSections,
          settings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('教材の保存に失敗しました');
      }
      
      // 成功時は教材一覧ページにリダイレクト
      return Promise.resolve();
    } catch (error) {
      console.error('教材公開エラー:', error);
      return Promise.reject(error);
    }
  };
  
  // 現在のステップに応じたコンポーネントをレンダリング
  const renderStep = () => {
    switch (step) {
      case 'basic-info':
        return (
          <BasicInfoStep 
            initialData={basicInfo}
            onSave={setBasicInfo}
            onBack={handleBack}
          />
        );
      case 'content':
        return (
          <ContentStep 
            initialData={contentSections}
            onSave={setContentSections}
            onBack={handleBack}
          />
        );
      case 'settings':
        return (
          <SettingsStep 
            initialData={settings}
            onSave={setSettings}
            onBack={handleBack}
          />
        );
      case 'confirm':
        return (
          <ConfirmStep 
            basicInfo={basicInfo}
            contentSections={contentSections}
            settings={settings}
            onPublish={handlePublish}
            onBack={handleBack}
          />
        );
      default:
        return (
          <BasicInfoStep 
            initialData={basicInfo}
            onSave={setBasicInfo}
            onBack={handleBack}
          />
        );
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      {renderStep()}
    </div>
  );
};

export default StandardCreator; 