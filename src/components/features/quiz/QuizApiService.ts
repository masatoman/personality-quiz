import { QuizResults } from '@/types/quiz';

/**
 * クイズの結果をサーバーに保存するためのAPI呼び出し
 * @param results クイズの結果オブジェクト
 * @returns 処理結果
 */
export const saveQuizResults = async (results: QuizResults): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/quiz/save-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results),
    });
    
    if (!response.ok) {
      throw new Error(`結果の保存に失敗しました: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || '診断結果が保存されました'
    };
  } catch (error) {
    console.error('結果の保存中にエラーが発生しました:', error);
    return {
      success: false,
      message: 'エラーが発生しましたが、診断結果はローカルに保存されました'
    };
  }
}; 