import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// コンテンツセクションの型定義
interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  title: string;
  content: string;
  options?: string[];
  answer?: number;
}

interface ContentStepProps {
  initialData?: ContentSection[];
  onSave: (data: ContentSection[]) => void;
  onBack: () => void;
}

const ContentStep: React.FC<ContentStepProps> = ({ initialData, onSave, onBack }) => {
  const router = useRouter();
  const [sections, setSections] = useState<ContentSection[]>(initialData || []);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const handleNext = () => {
    if (sections.length === 0) {
      // トーストメッセージに置き換える（または親コンポーネントから渡されたコールバックを使用）
      console.warn('コンテンツを最低1つ追加してください');
      return;
    }
    
    onSave(sections);
    router.push('/create/standard/settings');
  };
  
  const addSection = (type: 'text' | 'image' | 'video' | 'quiz') => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type,
      title: '',
      content: '',
      ...(type === 'quiz' ? { options: ['', '', '', ''], answer: 0 } : {})
    };
    
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };
  
  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    if (activeSection === id) {
      setActiveSection(null);
    }
  };
  
  const updateSection = (id: string, updates: Partial<ContentSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSections(items);
  };
  
  const updateQuizOption = (sectionId: string, optionIndex: number, value: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.options) return;
    
    const newOptions = [...section.options];
    newOptions[optionIndex] = value;
    
    updateSection(sectionId, { options: newOptions });
  };
  
  const renderSectionEditor = (section: ContentSection) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">セクションタイトル</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="タイトルを入力"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">テキスト内容</label>
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                placeholder="ここにテキストを入力"
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">画像タイトル</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="画像のタイトルを入力"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">画像URL</label>
              <input
                type="text"
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                placeholder="画像のURLを入力"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              画像をアップロード
            </button>
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">動画タイトル</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="動画のタイトルを入力"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">動画URL (YouTube/Vimeo)</label>
              <input
                type="text"
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        );
        
      case 'quiz':
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">問題</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                placeholder="質問を入力"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">説明 (任意)</label>
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                placeholder="問題の補足説明"
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">選択肢</label>
              {section.options?.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="radio"
                    checked={section.answer === index}
                    onChange={() => updateSection(section.id, { answer: index })}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateQuizOption(section.id, index, e.target.value)}
                    placeholder={`選択肢 ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">* ラジオボタンをクリックして正解を選択してください</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="flex items-center mb-2">
        <button 
          onClick={onBack}
          className="mr-2 text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">コンテンツ作成</h1>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span className="font-bold text-blue-500">ステップ 2/4</span>
        <span>基本情報 → コンテンツ → 設定 → 確認</span>
      </div>
      
      {/* コンテンツ追加ボタン */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => addSection('text')}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
        >
          + テキスト
        </button>
        <button 
          onClick={() => addSection('image')}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
        >
          + 画像
        </button>
        <button 
          onClick={() => addSection('video')}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
        >
          + 動画
        </button>
        <button 
          onClick={() => addSection('quiz')}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
        >
          + クイズ
        </button>
      </div>
      
      {/* コンテンツリスト */}
      <div className="bg-gray-50 p-4 rounded-lg">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            上のボタンからコンテンツを追加してください
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white p-3 rounded-lg border ${
                            activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div {...provided.dragHandleProps} className="mr-2 cursor-move text-gray-400">
                                ⋮⋮
                              </div>
                              <div className="font-medium">
                                {section.type === 'text' && '📝 '}
                                {section.type === 'image' && '🖼️ '}
                                {section.type === 'video' && '🎬 '}
                                {section.type === 'quiz' && '❓ '}
                                {section.title || `${
                                  section.type === 'text' ? 'テキスト' : 
                                  section.type === 'image' ? '画像' : 
                                  section.type === 'video' ? '動画' : 'クイズ'
                                } ${index + 1}`}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                {activeSection === section.id ? '完了' : '編集'}
                              </button>
                              <button
                                onClick={() => removeSection(section.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                          
                          {activeSection === section.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {renderSectionEditor(section)}
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
        )}
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleNext}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          次へ進む
        </button>
      </div>
    </div>
  );
};

export default ContentStep; 