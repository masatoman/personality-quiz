import { useState } from 'react';
import { QuizResults } from '@/types/quiz';

export const useResultsSave = () => {
  const [savingResults, setSavingResults] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveResultsToDatabase = async (results: QuizResults, userId: string) => {
    try {
      setSavingResults(true);
      setSaveError(null);
      
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...results,
          userId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`結果の保存に失敗しました: ${response.status}`);
      }
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('結果の保存に失敗しました:', error);
      setSaveError('結果の保存中にエラーが発生しました。');
    } finally {
      setSavingResults(false);
    }
  };

  return {
    savingResults,
    saveSuccess,
    saveError,
    saveResultsToDatabase
  };
}; 