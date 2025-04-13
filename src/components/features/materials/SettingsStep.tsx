import React, { useState } from 'react';
import { useRouter } from 'next/router';

// 設定項目の型定義
interface SettingsData {
  isPublic: boolean;
  allowComments: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  targetAudience: string[];
  prerequisites: string;
}

interface SettingsStepProps {
  initialData?: Partial<SettingsData>;
  onSave: (data: SettingsData) => void;
  onBack: () => void;
}

const SettingsStep: React.FC<SettingsStepProps> = ({ initialData, onSave, onBack }) => {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData>({
    isPublic: initialData?.isPublic ?? true,
    allowComments: initialData?.allowComments ?? true,
    difficulty: initialData?.difficulty ?? 'beginner',
    estimatedTime: initialData?.estimatedTime ?? 30,
    targetAudience: initialData?.targetAudience ?? [],
    prerequisites: initialData?.prerequisites ?? '',
  });
  
  const [currentAudience, setCurrentAudience] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const handleChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const addTargetAudience = () => {
    if (!currentAudience.trim()) return;
    
    if (!settings.targetAudience.includes(currentAudience)) {
      setSettings(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, currentAudience]
      }));
    }
    
    setCurrentAudience('');
  };
  
  const removeTargetAudience = (audience: string) => {
    setSettings(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(a => a !== audience)
    }));
  };
  
  const handleSubmit = () => {
    // 簡単なバリデーション
    const newErrors: { [key: string]: string } = {};
    
    if (settings.estimatedTime <= 0) {
      newErrors.estimatedTime = '学習時間は1分以上に設定してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 保存処理
    onSave(settings);
    
    // 確認画面へ
    router.push('/create/standard/confirm');
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
        <h1 className="text-xl font-bold">設定</h1>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span className="font-bold text-blue-500">ステップ 3/4</span>
        <span>基本情報 → コンテンツ → 設定 → 確認</span>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-6">
        {/* 公開設定 */}
        <div>
          <h2 className="font-bold mb-3">公開設定</h2>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isPublic"
              checked={settings.isPublic}
              onChange={(e) => handleChange('isPublic', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="cursor-pointer">
              公開する
              <p className="text-sm text-gray-500">
                チェックを外すと下書きとして保存され、自分だけが閲覧できます
              </p>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowComments"
              checked={settings.allowComments}
              onChange={(e) => handleChange('allowComments', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="allowComments" className="cursor-pointer">
              コメントを許可する
              <p className="text-sm text-gray-500">
                学習者からのフィードバックやコメントを受け取ることができます
              </p>
            </label>
          </div>
        </div>
        
        {/* 難易度設定 */}
        <div>
          <h2 className="font-bold mb-3">難易度</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleChange('difficulty', 'beginner')}
              className={`flex-1 py-2 rounded-lg ${
                settings.difficulty === 'beginner'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              初級
            </button>
            <button
              onClick={() => handleChange('difficulty', 'intermediate')}
              className={`flex-1 py-2 rounded-lg ${
                settings.difficulty === 'intermediate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中級
            </button>
            <button
              onClick={() => handleChange('difficulty', 'advanced')}
              className={`flex-1 py-2 rounded-lg ${
                settings.difficulty === 'advanced'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              上級
            </button>
          </div>
        </div>
        
        {/* 学習時間の目安 */}
        <div>
          <h2 className="font-bold mb-3">学習時間の目安</h2>
          
          <div>
            <div className="flex items-center">
              <input
                type="number"
                value={settings.estimatedTime}
                onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
                min="1"
                className="w-20 p-2 border border-gray-300 rounded-lg mr-2"
              />
              <span>分</span>
            </div>
            {errors.estimatedTime && (
              <p className="text-red-500 text-sm mt-1">{errors.estimatedTime}</p>
            )}
          </div>
        </div>
        
        {/* 対象者 */}
        <div>
          <h2 className="font-bold mb-3">対象者</h2>
          
          <div className="mb-2">
            <div className="flex mb-2">
              <input
                type="text"
                value={currentAudience}
                onChange={(e) => setCurrentAudience(e.target.value)}
                placeholder="例: プログラミング初心者"
                className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                onKeyDown={(e) => e.key === 'Enter' && addTargetAudience()}
              />
              <button
                onClick={addTargetAudience}
                className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
              >
                追加
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Enterキーを押すか「追加」ボタンをクリックして対象者を追加できます
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings.targetAudience.map((audience, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
              >
                {audience}
                <button
                  onClick={() => removeTargetAudience(audience)}
                  className="ml-2 text-blue-700 hover:text-blue-900"
                >
                  &times;
                </button>
              </div>
            ))}
            {settings.targetAudience.length === 0 && (
              <p className="text-gray-400 text-sm">対象者が設定されていません</p>
            )}
          </div>
        </div>
        
        {/* 前提条件 */}
        <div>
          <h2 className="font-bold mb-3">前提条件</h2>
          
          <textarea
            value={settings.prerequisites}
            onChange={(e) => handleChange('prerequisites', e.target.value)}
            placeholder="例: JavaScript の基本的な文法を理解していること"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            この教材を学習するために必要な知識や環境などを入力してください（任意）
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          次へ進む
        </button>
      </div>
    </div>
  );
};

export default SettingsStep; 