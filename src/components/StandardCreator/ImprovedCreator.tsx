'use client';

import React, { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon, EyeIcon, CogIcon } from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../ui/ToastContainer';
import { FaPencilAlt, FaQuestion, FaImage, FaVideo, FaMusic, FaStar, FaPalette, FaLightbulb, FaCheck } from 'react-icons/fa';

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
  const [material, setMaterial] = useState<MaterialData>({
    title: '',
    description: '',
    category: 'be_verbs',
    difficulty: 'beginner',
    estimatedTime: 5,
    isPublic: true,
    allowComments: true,
    sections: []
  });
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // 学習時間の自動推定
  useEffect(() => {
    const wordCount = material.sections.reduce((total, section) => {
      return total + (section.content?.length || 0);
    }, 0);
    const estimatedMinutes = Math.max(3, Math.ceil(wordCount / 200));
    setMaterial(prev => ({ ...prev, estimatedTime: estimatedMinutes }));
  }, [material.sections]);

  // コンテンツセクション追加
  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      title: type === 'text' ? '文法解説' : 
             type === 'image' ? '画像セクション' :
             type === 'video' ? '動画セクション' : '練習問題',
      content: type === 'quiz' ? '文法問題を入力してください' : '',
      ...(type === 'quiz' ? { options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'], answer: 0 } : {})
    };
    
    setMaterial(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(newSection.id);
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
      
      showSuccess(
        '🎉 教材公開完了！',
        '素晴らしい！教材を公開しました。「教えることで学ぶ」体験はいかがでしたか？',
        3000
      );
      
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
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">教材作成</h1>
                <p className="text-sm text-gray-700 font-medium">中学英文法の解説を作成しましょう</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center px-3 py-2 rounded-lg transition ${
                  previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                プレビュー
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center px-3 py-2 rounded-lg transition ${
                  showSettings ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CogIcon className="w-4 h-4 mr-2" />
                設定
              </button>
              
              <button
                onClick={() => setStep('publish')}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg font-medium transition ${
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* メイン編集エリア */}
          <div className="xl:col-span-3 space-y-6">
            {/* タイトル入力 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  教材タイトル <span className="text-red-500">*</span>
                </label>
                <span className="text-sm text-gray-600 font-medium">
                  {material.title.length}/100文字
                </span>
              </div>
              <input
                type="text"
                value={material.title}
                onChange={(e) => setMaterial(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例: be動詞の基本をマスターしよう"
                className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-400 bg-transparent"
                style={{ outline: 'none' }}
              />
            </div>

            {/* コンテンツ追加エリア */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">コンテンツ</h3>
                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {material.sections.length}セクション
                </span>
              </div>
              
              {/* セクション追加ボタン */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => addSection('text')}
                  className="flex items-center p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                    <FaPencilAlt className="text-blue-600 text-xl" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">文法解説</div>
                    <div className="text-sm text-gray-600 font-medium">説明文や例文を追加</div>
                  </div>
                </button>
                
                <button
                  onClick={() => addSection('quiz')}
                  className="flex items-center p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                    <FaQuestion className="text-purple-600 text-xl" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">練習問題</div>
                    <div className="text-sm text-gray-600 font-medium">選択式問題を追加</div>
                  </div>
                </button>
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
                                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                      <div {...provided.dragHandleProps} className="cursor-move">
                                        <Bars3Icon className="w-5 h-5 text-gray-400" />
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-900">{section.title}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          section.type === 'text' ? 'bg-blue-100 text-blue-700' :
                                          section.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {section.type === 'text' ? '解説' : 
                                           section.type === 'quiz' ? '問題' : section.type}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setActiveSection(
                                          activeSection === section.id ? null : section.id
                                        )}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        {activeSection === section.id ? '閉じる' : '編集'}
                                      </button>
                                      <button
                                        onClick={() => removeSection(section.id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {activeSection === section.id && (
                                    <div className="p-6 bg-white">
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

              {/* 空状態 */}
              {material.sections.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">セクションを追加しましょう</h3>
                  <p className="text-gray-600 mb-6 font-medium">上記のボタンから解説や問題を追加してください</p>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="xl:col-span-1 space-y-6">
            {/* 設定パネル */}
            {showSettings && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文法項目</label>
                    <select
                      value={material.category}
                      onChange={(e) => setMaterial(prev => ({ 
                        ...prev, 
                        category: e.target.value
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="be_verbs">be動詞・一般動詞</option>
                      <option value="present_progressive">現在進行形・過去形</option>
                      <option value="future_modal">未来形・助動詞</option>
                      <option value="present_perfect">現在完了</option>
                      <option value="passive_voice">受動態</option>
                      <option value="infinitive_gerund">不定詞・動名詞</option>
                      <option value="relative_pronouns">関係代名詞</option>
                      <option value="others">その他</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学年レベル</label>
                    <select
                      value={material.difficulty}
                      onChange={(e) => setMaterial(prev => ({ 
                        ...prev, 
                        difficulty: e.target.value as MaterialData['difficulty']
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="beginner">中1レベル</option>
                      <option value="intermediate">中2レベル</option>
                      <option value="advanced">中3レベル</option>
                    </select>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-1">推定学習時間</div>
                    <div className="text-2xl font-bold text-blue-600">約{material.estimatedTime}分</div>
                    <div className="text-xs text-blue-700 font-medium">自動計算</div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={material.isPublic}
                        onChange={(e) => setMaterial(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">公開する</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={material.allowComments}
                        onChange={(e) => setMaterial(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">コメントを許可</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* プレビューパネル */}
            {previewMode && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">プレビュー</h3>
                <MaterialPreview material={material} />
              </div>
            )}

            {/* 進捗表示 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作成進捗</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">タイトル</span>
                  {material.title.trim() ? (
                    <FaCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">セクション</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.sections.length}個
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-medium">設定</span>
                  {material.category && material.difficulty ? (
                    <FaCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              </div>
              
              {canProceed && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <FaCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">公開準備完了</span>
                  </div>
                </div>
              )}
            </div>
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">セクションタイトル</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="例：be動詞の基本"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">解説内容</label>
          <textarea
            value={section.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="文法の説明や例文を入力してください..."
            rows={8}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  }
  
  if (section.type === 'quiz') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">問題タイトル</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="例：be動詞の練習"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">問題文</label>
          <textarea
            value={section.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="問題文を入力してください..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">選択肢</label>
          <div className="space-y-3">
            {section.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`answer-${section.id}`}
                  checked={section.answer === index}
                  onChange={() => onUpdate({ answer: index })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

// プレビューコンポーネント
const MaterialPreview: React.FC<{ material: MaterialData }> = ({ material }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-lg text-gray-900">{material.title || 'タイトル未設定'}</h4>
        <div className="flex items-center space-x-2 mt-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            material.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
            material.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {material.difficulty === 'beginner' ? '中1' :
             material.difficulty === 'intermediate' ? '中2' : '中3'}
          </span>
                            <span className="text-sm text-gray-700 font-medium">約{material.estimatedTime}分</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {material.sections.length === 0 ? (
          <p className="text-gray-600 text-sm font-medium">コンテンツが追加されていません</p>
        ) : (
          material.sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{index + 1}.</span>
                  <span className="text-sm text-gray-700">{section.title}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  section.type === 'text' ? 'bg-blue-100 text-blue-700' :
                  section.type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {section.type === 'text' ? '解説' : 
                   section.type === 'quiz' ? '問題' : section.type}
                </span>
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
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-xl">
                ←
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">公開設定</h1>
                <p className="text-sm text-gray-700 font-medium">最終確認と公開設定</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              ステップ 2/2
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* プレビュー */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">教材プレビュー</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <MaterialPreview material={material} />
            </div>
          </div>

          {/* 公開設定 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">公開設定</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCheck className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-blue-900">🎉 公開準備完了！</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      この教材を公開すると、他のユーザーが学習できるようになります
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-700 font-medium">公開状態</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    material.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {material.isPublic ? '公開' : '下書き'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-700 font-medium">コメント</span>
                  <span className="text-sm text-gray-900">
                    {material.allowComments ? '許可' : '不許可'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-700 font-medium">難易度</span>
                  <span className="text-sm text-gray-900">
                    {material.difficulty === 'beginner' ? '中1レベル' :
                     material.difficulty === 'intermediate' ? '中2レベル' : '中3レベル'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700 font-medium">学習時間</span>
                  <span className="text-sm text-gray-700 font-medium">約{material.estimatedTime}分</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isPublishing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isPublishing ? '公開中...' : 
                   material.isPublic ? '教材を公開する' : '下書きとして保存'}
                </button>
                
                <p className="text-center text-sm text-gray-600 mt-3 font-medium">
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