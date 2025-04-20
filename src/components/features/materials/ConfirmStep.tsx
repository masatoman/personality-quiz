import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// 基本情報の型定義
interface BasicInfo {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

// コンテンツの型定義
interface TextContent {
  text: string;
}

interface ImageContent {
  url: string;
  caption?: string;
}

interface VideoContent {
  url: string;
  caption?: string;
}

interface QuizContent {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// コンテンツセクションの型定義
interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  content: TextContent | ImageContent | VideoContent | QuizContent;
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

// 確認画面のプロパティ
interface ConfirmStepProps {
  basicInfo: BasicInfo;
  contentSections: ContentSection[];
  settings: SettingsData;
  onPublish: () => Promise<void>;
  onBack: () => void;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({
  basicInfo,
  contentSections,
  settings,
  onPublish,
  onBack
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onPublish();
      router.push('/my-materials'); // 公開後はマイ教材一覧へ
    } catch (err) {
      setError('教材の公開中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 難易度を日本語で表示
  const getDifficultyInJapanese = () => {
    switch (settings.difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '初級';
    }
  };
  
  // セクション数を種類ごとにカウント
  const sectionCounts = contentSections.reduce((acc, section) => {
    acc[section.type] = (acc[section.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="mr-2 text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">確認</h1>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span className="font-bold text-blue-500">最終確認</span>
        <span>基本情報 → コンテンツ → 設定 → 確認</span>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-6">
        {/* プレビューセクション */}
        <div>
          <h2 className="font-bold text-lg mb-4">教材プレビュー</h2>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            {/* カバー画像 */}
            {basicInfo.coverImage ? (
              <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                <Image 
                  src={basicInfo.coverImage} 
                  alt={basicInfo.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div className="w-full h-40 mb-4 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                カバー画像なし
              </div>
            )}
            
            {/* タイトルと説明 */}
            <h3 className="text-xl font-bold mb-2">{basicInfo.title}</h3>
            <p className="text-gray-700 mb-3">{basicInfo.description}</p>
            
            {/* タグ */}
            <div className="flex flex-wrap gap-2 mb-4">
              {basicInfo.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            {/* コンテンツ情報 */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm mb-2">
                <span>難易度:</span>
                <span className="font-medium">{getDifficultyInJapanese()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>学習時間:</span>
                <span className="font-medium">{settings.estimatedTime}分</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>セクション数:</span>
                <span className="font-medium">{contentSections.length}セクション</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* コンテンツ内容概要 */}
        <div>
          <h2 className="font-bold text-lg mb-3">コンテンツ概要</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium mb-1">テキスト</div>
              <div className="text-xl font-bold">{sectionCounts.text || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium mb-1">画像</div>
              <div className="text-xl font-bold">{sectionCounts.image || 0}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="font-medium mb-1">動画</div>
              <div className="text-xl font-bold">{sectionCounts.video || 0}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium mb-1">クイズ</div>
              <div className="text-xl font-bold">{sectionCounts.quiz || 0}</div>
            </div>
          </div>
        </div>
        
        {/* 公開設定確認 */}
        <div>
          <h2 className="font-bold text-lg mb-3">公開設定</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className={`w-5 h-5 mr-2 ${settings.isPublic ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <span className="font-medium">公開ステータス: </span>
                <span>{settings.isPublic ? '公開' : '非公開（下書き）'}</span>
              </div>
            </div>
            
            <div className="flex items-center mb-3">
              <CheckCircleIcon className={`w-5 h-5 mr-2 ${settings.allowComments ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <span className="font-medium">コメント: </span>
                <span>{settings.allowComments ? '許可' : '不許可'}</span>
              </div>
            </div>
            
            {settings.targetAudience.length > 0 && (
              <div className="mb-3">
                <span className="font-medium block mb-1">対象者:</span>
                <div className="flex flex-wrap gap-1">
                  {settings.targetAudience.map((audience, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {settings.prerequisites && (
              <div>
                <span className="font-medium block mb-1">前提条件:</span>
                <p className="text-sm text-gray-700">{settings.prerequisites}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* 公開ボタン */}
      <div className="pt-4">
        <button
          onClick={handlePublish}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium ${
            isSubmitting 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? '公開中...' : settings.isPublic ? '教材を公開する' : '下書きとして保存する'}
        </button>
        
        <p className="text-center text-sm text-gray-500 mt-3">
          公開後も内容の編集や非公開設定が可能です
        </p>
      </div>
    </div>
  );
};

export default ConfirmStep; 