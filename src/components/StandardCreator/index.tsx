"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import BasicInfoStep from './BasicInfoStep';
import ContentStep from './ContentStep';
import SettingsStep from './SettingsStep';
import ConfirmStep from './ConfirmStep';
import { useCreator } from '@/contexts/CreatorContext';

// 標準教材作成コンポーネント
const StandardCreator: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const step = params?.step as string;
  
  // Context APIから状態を取得
  const { 
    basicInfo, setBasicInfo,
    contentSections, setContentSections,
    settings, setSettings
  } = useCreator();

  // 開発用: コンポーネント初期化時にデータ状態をログ出力
  React.useEffect(() => {
    console.log('StandardCreator初期化 - 現在のステップ:', step);
    console.log('初期basicInfo:', basicInfo);
    console.log('初期contentSections:', contentSections);
    console.log('初期settings:', settings);
  }, [step, basicInfo, contentSections, settings]);
  
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
  
  // 基本情報保存と次のステップへの遷移
  const handleSaveBasicInfo = async (data: typeof basicInfo) => {
    console.log('基本情報を保存します:', data);
    
    // 重要: 深いコピーを作成してステート更新
    const newBasicInfo = JSON.parse(JSON.stringify(data));
    setBasicInfo(newBasicInfo);
    
    console.log('保存後のbasicInfo:', newBasicInfo);
    
    try {
      // Next.jsのルーターを使用してナビゲーション
      await router.push('/create/standard/content');
      console.log('コンテンツステップへの遷移が完了しました');
    } catch (error) {
      console.error('Next.jsルーターでのナビゲーションエラー:', error);
      
      // 代替方法: window.locationを使用する
      console.log('代替方法でナビゲーションを試みます');
      window.location.href = '/create/standard/content';
    }
  };
  
  // コンテンツ保存と次のステップへの遷移
  const handleSaveContent = async (data: typeof contentSections) => {
    console.log('コンテンツを保存します:', data);
    
    // 重要: 深いコピーを作成してステート更新
    const newContentSections = JSON.parse(JSON.stringify(data));
    setContentSections(newContentSections);
    
    console.log('保存後のcontentSections:', newContentSections);
    
    try {
      // Next.jsのルーターを使用してナビゲーション
      await router.push('/create/standard/settings');
      console.log('設定ステップへの遷移が完了しました');
    } catch (error) {
      console.error('Next.jsルーターでのナビゲーションエラー:', error);
      
      // 代替方法: window.locationを使用する
      console.log('代替方法でナビゲーションを試みます');
      window.location.href = '/create/standard/settings';
    }
  };
  
  // 設定保存と次のステップへの遷移
  const handleSaveSettings = async (data: typeof settings) => {
    console.log('設定を保存します:', data);
    
    // 重要: 深いコピーを作成してステート更新
    const newSettings = JSON.parse(JSON.stringify(data));
    setSettings(newSettings);
    
    console.log('保存後のsettings:', newSettings);
    
    try {
      // Next.jsのルーターを使用してナビゲーション
      await router.push('/create/standard/confirm');
      console.log('確認ステップへの遷移が完了しました');
    } catch (error) {
      console.error('Next.jsルーターでのナビゲーションエラー:', error);
      
      // 代替方法: window.locationを使用する
      console.log('代替方法でナビゲーションを試みます');
      window.location.href = '/create/standard/confirm';
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
            onSave={handleSaveBasicInfo}
            onBack={handleBack}
          />
        );
      case 'content':
        return (
          <ContentStep 
            initialData={contentSections}
            onSave={handleSaveContent}
            onBack={handleBack}
          />
        );
      case 'settings':
        return (
          <SettingsStep 
            initialData={settings}
            onSave={handleSaveSettings}
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
            onSave={handleSaveBasicInfo}
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