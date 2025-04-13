import React, { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { ArrowLeftIcon, PlusCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// 基本情報の型定義
interface BasicInfo {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

// コンポーネントのプロパティ
interface BasicInfoStepProps {
  initialData?: BasicInfo;
  onSave: (data: BasicInfo) => void;
  onBack: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  initialData,
  onSave,
  onBack
}) => {
  // 初期データがあれば使用、なければデフォルト値を設定
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(initialData || {
    title: '',
    description: '',
    tags: [],
    coverImage: undefined
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // フィールド変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
    
    // エラーがあれば削除
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // タグ追加ハンドラー
  const handleAddTag = () => {
    if (!currentTag.trim()) return;
    
    if (basicInfo.tags.includes(currentTag.trim())) {
      setErrors(prev => ({ ...prev, tag: '同じタグは追加できません' }));
      return;
    }
    
    if (basicInfo.tags.length >= 10) {
      setErrors(prev => ({ ...prev, tag: 'タグは最大10個までです' }));
      return;
    }
    
    setBasicInfo(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()]
    }));
    setCurrentTag('');
    
    // タグのエラーを削除
    if (errors.tag) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.tag;
        return newErrors;
      });
    }
  };
  
  // タグ削除ハンドラー
  const handleRemoveTag = (index: number) => {
    setBasicInfo(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  // エンターキーでのタグ追加
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // 画像選択処理
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };
  
  // 画像アップロード処理
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 画像ファイルのバリデーション
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: '画像ファイルのみアップロードできます' }));
      return;
    }
    
    // 画像サイズのバリデーション (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: '画像サイズは5MB以下にしてください' }));
      return;
    }
    
    // 画像プレビュー用にURLを生成
    const imageUrl = URL.createObjectURL(file);
    setBasicInfo(prev => ({ ...prev, coverImage: imageUrl }));
    
    // 画像エラーを削除
    if (errors.image) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };
  
  // 画像削除処理
  const handleRemoveImage = () => {
    setBasicInfo(prev => ({ ...prev, coverImage: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Record<string, string> = {};
    
    if (!basicInfo.title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    } else if (basicInfo.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください';
    }
    
    if (!basicInfo.description.trim()) {
      newErrors.description = '説明を入力してください';
    } else if (basicInfo.description.length > 500) {
      newErrors.description = '説明は500文字以内で入力してください';
    }
    
    if (basicInfo.tags.length === 0) {
      newErrors.tag = '少なくとも1つのタグを追加してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // データを保存して次のステップへ
    onSave(basicInfo);
  };
  
  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">基本情報</h1>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span className="font-bold text-blue-500">ステップ 1/4</span>
        <span>基本情報 → コンテンツ → 設定 → 確認</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトル入力 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={basicInfo.title}
            onChange={handleChange}
            placeholder="教材のタイトルを入力してください"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {basicInfo.title.length}/100
          </p>
        </div>
        
        {/* 説明入力 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={basicInfo.description}
            onChange={handleChange}
            placeholder="教材の内容を簡潔に説明してください"
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {basicInfo.description.length}/500
          </p>
        </div>
        
        {/* タグ入力 */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
            タグ <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              id="tag"
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="タグを入力して追加"
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.tag ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              追加
            </button>
          </div>
          {errors.tag && (
            <p className="mt-1 text-sm text-red-600">{errors.tag}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            タグを入力し、Enterまたは追加ボタンで追加してください（最大10個）
          </p>
          
          {/* タグ一覧 */}
          {basicInfo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {basicInfo.tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-1 text-blue-700 hover:text-blue-900 focus:outline-none"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* カバー画像アップロード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カバー画像（任意）
          </label>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          {basicInfo.coverImage ? (
            <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
              <Image 
                src={basicInfo.coverImage} 
                alt="カバー画像"
                fill
                style={{ objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleImageSelect}
              className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none"
            >
              <PlusCircleIcon className="w-10 h-10 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                クリックして画像をアップロード
              </span>
              <span className="mt-1 text-xs text-gray-400">
                推奨サイズ: 1200 x 630px (最大5MB)
              </span>
            </button>
          )}
          
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>
        
        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            次へ進む
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoStep; 