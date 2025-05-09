'use client';

import { useState } from 'react';

export default function TestConnection() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '接続エラーが発生しました');
      console.error('接続テストエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase接続テスト</h1>
      
      <button 
        onClick={testApiConnection}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? '接続テスト中...' : '接続テスト実行'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">結果:</h2>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
