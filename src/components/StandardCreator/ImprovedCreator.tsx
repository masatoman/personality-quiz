'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, EyeIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../ui/ToastContainer';

// 型定義
interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  title: string;
  content: string;
  options?: string[];
  answer?: number;
}

interface MaterialData {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  isPublic: boolean;
  allowComments: boolean;
  sections: ContentSection[];
}

const ImprovedCreator: React.FC = () => {
  const [step, setStep] = useState<'create' | 'publish'>('create');
  const [showFirstTimeHelp, setShowFirstTimeHelp] = useState(false);
  const [material, setMaterial] = useState<MaterialData>({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'beginner',
    estimatedTime: 5,
    isPublic: true,
    allowComments: true,
    sections: []
  });
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // 学習時間の自動推定
  useEffect(() => {
    const wordCount = material.sections.reduce((total, section) => {
      return total + (section.content?.length || 0);
    }, 0);
    const estimatedMinutes = Math.max(3, Math.ceil(wordCount / 200)); // 200文字/分として計算
    setMaterial(prev => ({ ...prev, estimatedTime: estimatedMinutes }));
  }, [material.sections]);

  // 初回ユーザーかチェック
  useEffect(() => {
    const hasCreatedMaterial = localStorage.getItem('has_created_material');
    if (!hasCreatedMaterial && material.sections.length === 0) {
      setShowFirstTimeHelp(true);
    }
  }, [material.sections.length]);

  // コンテンツセクション追加
  const addSection = (type: ContentSection['type']) => {
    console.log('addSection called with type:', type);
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      title: type === 'text' ? 'テキストセクション' : 
             type === 'image' ? '画像セクション' :
             type === 'video' ? '動画セクション' : 'クイズ',
      content: type === 'quiz' ? 'クイズの問題文を入力してください' : '',
      ...(type === 'quiz' ? { options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'], answer: 0 } : {})
    };
    
    console.log('新しいセクション:', newSection);
    setMaterial(prev => {
      const updated = {
        ...prev,
        sections: [...prev.sections, newSection]
      };
      console.log('更新後のmaterial:', updated);
      return updated;
    });
    setActiveSection(newSection.id);
    console.log('activeSection set to:', newSection.id);
  };

  // セクション削除
  const removeSection = (id: string) => {
    setMaterial(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }));
    if (activeSection === id) setActiveSection(null);
  };

  // セクション更新
  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setMaterial(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      )
    }));
  };

  // ドラッグ&ドロップ
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(material.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMaterial(prev => ({ ...prev, sections: items }));
  };

  // 公開処理
  const handlePublish = async () => {
    try {
      console.log('公開データ:', material);
      
      // APIデータの形式に変換（データベーススキーマに合わせる）
      const publishData = {
        title: material.title,
        description: material.description || '',
        content: JSON.stringify({
          sections: material.sections.map(section => ({
            type: section.type,
            title: section.title,
            content: section.content,
            options: section.options || [],
            answer: section.answer || 0
          }))
        }),
        category: material.category,
        difficulty: material.difficulty,
        estimated_time: material.estimatedTime,
        is_public: material.isPublic,
        allow_comments: material.allowComments,
        tags: []
      };
      
      console.log('API送信データ:', publishData);
      
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '教材の保存に失敗しました');
      }
      
      const result = await response.json();
      console.log('保存成功:', result);
      
      // 初回作成フラグを設定
      localStorage.setItem('has_created_material', 'true');
      
      showSuccess(
        '🎉 初回教材作成完了！',
        '素晴らしい！教材を公開しました。「教えることで学ぶ」体験はいかがでしたか？',
        3000
      );
      
      // 少し遅延してから教材一覧ページにリダイレクト
      setTimeout(() => {
        window.location.href = '/my-materials';
      }, 2000);
      
    } catch (error) {
      console.error('公開エラー:', error);
      showError(
        '公開に失敗しました',
        error.message || '教材の公開中にエラーが発生しました。もう一度お試しください。',
        7000
      );
    }
  };

  // バリデーション
  const canProceed = material.title.trim() && material.category && material.sections.length > 0;

  if (step === 'publish') {
    return <PublishStep material={material} onBack={() => setStep('create')} onPublish={handlePublish} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 初回ヘルプモーダル */}
      {showFirstTimeHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                初回教材作成へようこそ！
              </h2>
              <p className="text-gray-600">
                「教えることで学ぶ」体験を一緒に始めましょう
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">教材の基本情報を入力</h3>
                  <p className="text-sm text-gray-600">タイトル、説明、カテゴリを設定します</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">コンテンツセクションを追加</h3>
                  <p className="text-sm text-gray-600">テキスト、画像、動画、クイズなど様々な形式で作成</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">プレビューして公開</h3>
                  <p className="text-sm text-gray-600">内容を確認してコミュニティと共有しましょう</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">💡 初回のコツ</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 簡単なトピックから始めてみましょう</li>
                <li>• 自分が理解していることを説明してみてください</li>
                <li>• 1-2個のセクションからスタートでも十分です</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFirstTimeHelp(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                始めましょう！
              </button>
              <button
                onClick={() => {
                  setShowFirstTimeHelp(false);
                  window.history.back();
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <h1 className="text-xl font-semibold">教材作成 (改善版)</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                ステップ 1/2
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center px-3 py-1 rounded-md transition ${
                  previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                👁️ プレビュー
              </button>
              
              <button
                onClick={() => setStep('publish')}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  canProceed
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                公開設定へ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メイン編集エリア */}
          <div className="lg:col-span-2 space-y-6">
            {/* タイトル入力 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教材タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={material.title}
                onChange={(e) => setMaterial(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例: 英語の基本文法マスター講座"
                className="w-full text-xl font-semibold border-none focus:ring-0 p-0 placeholder-gray-400"
                style={{ fontSize: '1.5rem', outline: 'none' }}
              />
              <div className="mt-2 text-sm text-gray-500">
                {material.title.length}/100文字
              </div>
            </div>

            {/* コンテンツ追加ボタン */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">コンテンツを追加</h3>
                <span className="text-sm text-gray-500">{material.sections.length}セクション</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addSection('text')}
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <span className="text-3xl mb-2">📝</span>
                  <span className="text-sm font-medium">テキスト</span>
                  <span className="text-xs text-gray-500 mt-1">文章・説明を追加</span>
                </button>
                
                <button
                  onClick={() => addSection('quiz')}
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
                >
                  <span className="text-3xl mb-2">❓</span>
                  <span className="text-sm font-medium">クイズ</span>
                  <span className="text-xs text-gray-500 mt-1">選択式問題を追加</span>
                </button>
              </div>
              
              {/* 有料プラン限定機能の案内 */}
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <span className="text-xl mr-3">✨</span>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      プレミアム機能
                    </h4>
                    <p className="text-xs text-yellow-700 mb-2">
                      有料プランでは画像・動画・音声ファイルの追加も可能になります
                    </p>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">🖼️ 画像</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">🎥 動画</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">🎵 音声</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* コンテンツセクション一覧 */}
            {material.sections.length > 0 && (
              <div className="space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {material.sections.map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                              >
                                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                                  <div className="flex items-center">
                                    <div {...provided.dragHandleProps} className="mr-3 cursor-move">
                                      <Bars3Icon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span className="font-medium">{section.title}</span>
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                      {section.type}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => setActiveSection(
                                        activeSection === section.id ? null : section.id
                                      )}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      {activeSection === section.id ? '閉じる' : '編集'}
                                    </button>
                                    <button
                                      onClick={() => removeSection(section.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                {activeSection === section.id && (
                                  <div className="p-4">
                                    <SectionEditor 
                                      section={section} 
                                      onUpdate={(updates) => updateSection(section.id, updates)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </div>

          {/* サイドバー: プレビュー + 設定 */}
          <div className="lg:col-span-1 space-y-6">
            {/* クイック設定 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium mb-4">基本設定</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                  <select
                    value={material.category}
                    onChange={(e) => setMaterial(prev => ({ 
                      ...prev, 
                      category: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="general">一般</option>
                    <option value="grammar">文法</option>
                    <option value="vocabulary">語彙</option>
                    <option value="listening">リスニング</option>
                    <option value="reading">リーディング</option>
                    <option value="writing">ライティング</option>
                    <option value="speaking">スピーキング</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">難易度</label>
                  <select
                    value={material.difficulty}
                    onChange={(e) => setMaterial(prev => ({ 
                      ...prev, 
                      difficulty: e.target.value as MaterialData['difficulty']
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="beginner">初心者</option>
                    <option value="intermediate">中級者</option>
                    <option value="advanced">上級者</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    推定学習時間
                  </label>
                  <div className="text-lg font-semibold text-blue-600">
                    約{material.estimatedTime}分
                  </div>
                  <div className="text-xs text-gray-500">自動計算</div>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={material.isPublic}
                      onChange={(e) => setMaterial(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">公開する</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={material.allowComments}
                      onChange={(e) => setMaterial(prev => ({ ...prev, allowComments: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm">コメントを許可</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ライブプレビュー */}
            {previewMode && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium mb-4">プレビュー</h3>
                <MaterialPreview material={material} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* トーストメッセージ */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

// セクションエディタコンポーネント
const SectionEditor: React.FC<{
  section: ContentSection;
  onUpdate: (updates: Partial<ContentSection>) => void;
}> = ({ section, onUpdate }) => {
  if (section.type === 'text') {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="セクションタイトル"
          className="w-full font-medium border border-gray-300 rounded-md px-3 py-2"
        />
        <textarea
          value={section.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="テキストを入力してください..."
          rows={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
    );
  }
  
  if (section.type === 'quiz') {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="クイズタイトル"
          className="w-full font-medium border border-gray-300 rounded-md px-3 py-2"
        />
        <textarea
          value={section.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="問題文を入力してください..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">選択肢</label>
          {section.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`answer-${section.id}`}
                checked={section.answer === index}
                onChange={() => onUpdate({ answer: index })}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...(section.options || [])];
                  newOptions[index] = e.target.value;
                  onUpdate({ options: newOptions });
                }}
                placeholder={`選択肢${index + 1}`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-1"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 画像・動画セクションは有料プラン限定のため、現在は無効
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="セクションタイトル"
        className="w-full font-medium border border-gray-300 rounded-md px-3 py-2"
      />
      
      <div className="border-2 border-dashed border-yellow-200 bg-yellow-50 rounded-lg p-8 text-center">
        <span className="text-4xl mb-2 block">🔒</span>
        <h3 className="text-lg font-medium text-yellow-800 mb-2">プレミアム機能</h3>
        <p className="text-yellow-700 mb-4">
          {section.type === 'image' ? '画像' : '動画'}アップロードは有料プランでご利用いただけます
        </p>
        <button className="px-6 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700 transition">
          プレミアムプランを見る
        </button>
      </div>
    </div>
  );
};

// プレビューコンポーネント
const MaterialPreview: React.FC<{ material: MaterialData }> = ({ material }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-lg">{material.title || 'タイトル未設定'}</h4>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mr-2">
            {material.difficulty === 'beginner' ? '初心者' :
             material.difficulty === 'intermediate' ? '中級者' : '上級者'}
          </span>
          <span>約{material.estimatedTime}分</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {material.sections.length === 0 ? (
          <p className="text-gray-400 text-sm">コンテンツが追加されていません</p>
        ) : (
          material.sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded p-3 text-sm">
              <div className="font-medium">{index + 1}. {section.title}</div>
              <div className="text-gray-600 mt-1 flex items-center">
                {section.type === 'text' ? '📝' :
                 section.type === 'image' ? '🖼️' :
                 section.type === 'video' ? '🎥' : '❓'} 
                <span className="ml-1">{section.type}</span>
                {(section.type === 'image' || section.type === 'video') && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">プレミアム</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 公開ステップコンポーネント
const PublishStep: React.FC<{
  material: MaterialData;
  onBack: () => void;
  onPublish: () => Promise<void>;
}> = ({ material, onBack, onPublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-4 text-gray-500 hover:text-gray-700">
                ←
              </button>
              <h1 className="text-xl font-semibold">公開設定</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                ステップ 2/2
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* プレビュー */}
          <div>
            <h2 className="text-lg font-semibold mb-4">教材プレビュー</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <MaterialPreview material={material} />
            </div>
          </div>

          {/* 公開設定 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">公開設定</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium">🎉 公開準備完了！</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    この教材を公開すると、他のユーザーが学習できるようになります
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>公開状態</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    material.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {material.isPublic ? '公開' : '下書き'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>コメント</span>
                  <span className="text-sm text-gray-600">
                    {material.allowComments ? '許可' : '不許可'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>難易度</span>
                  <span className="text-sm text-gray-600">
                    {material.difficulty === 'beginner' ? '初心者向け' :
                     material.difficulty === 'intermediate' ? '中級者向け' : '上級者向け'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>学習時間</span>
                  <span className="text-sm text-gray-600">約{material.estimatedTime}分</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isPublishing
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPublishing ? '公開中...' : 
                   material.isPublic ? '教材を公開する' : '下書きとして保存'}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-3">
                  公開後も編集・設定変更が可能です
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCreator; 