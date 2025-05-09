'use client';

import { useState } from 'react';

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('未確認');
  const [connectionResult, setConnectionResult] = useState<any>(null);
  
  const [seedStatus, setSeedStatus] = useState<string>('未登録');
  const [seedResult, setSeedResult] = useState<any>(null);
  
  const [loading, setLoading] = useState<boolean>(false);

  const testConnection = async () => {
    try {
      setLoading(true);
      setConnectionStatus('接続中...');
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      
      setConnectionResult(data);
      setConnectionStatus(data.success ? '接続成功' : '接続失敗');
    } catch (error) {
      console.error('接続テストエラー:', error);
      setConnectionStatus('エラー発生');
      setConnectionResult({ error: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      setLoading(true);
      setSeedStatus('データ登録中...');
      const response = await fetch('/api/seed-materials');
      const data = await response.json();
      
      setSeedResult(data);
      setSeedStatus(data.success ? 'データ登録成功' : 'データ登録失敗');
    } catch (error) {
      console.error('データ登録エラー:', error);
      setSeedStatus('エラー発生');
      setSeedResult({ error: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabaseテスト</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 接続テスト */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">接続テスト</h2>
          <div className="flex items-center mb-4">
            <span className="mr-2">ステータス:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              connectionStatus === '接続成功' ? 'bg-green-100 text-green-800' :
              connectionStatus === '接続失敗' ? 'bg-red-100 text-red-800' :
              connectionStatus === '接続中...' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {connectionStatus}
            </span>
          </div>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && connectionStatus === '接続中...' ? '接続中...' : '接続テスト実行'}
          </button>
          
          {connectionResult && (
            <div className="mt-4">
              <p className="font-medium mb-2">結果:</p>
              <div className="p-3 bg-gray-100 rounded-md max-h-60 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(connectionResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
        
        {/* データ登録テスト */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">教材データ登録</h2>
          <div className="flex items-center mb-4">
            <span className="mr-2">ステータス:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              seedStatus === 'データ登録成功' ? 'bg-green-100 text-green-800' :
              seedStatus === 'データ登録失敗' ? 'bg-red-100 text-red-800' :
              seedStatus === 'データ登録中...' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {seedStatus}
            </span>
          </div>
          
          <button
            onClick={seedData}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && seedStatus === 'データ登録中...' ? 'データ登録中...' : 'データ登録実行'}
          </button>
          
          {seedResult && (
            <div className="mt-4">
              <p className="font-medium mb-2">結果:</p>
              <div className="p-3 bg-gray-100 rounded-md max-h-60 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(seedResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-gray-600">
          * 接続テスト: Supabaseへの接続状態を確認します<br />
          * データ登録: サンプル教材データをSupabaseに登録します
        </p>
      </div>
    </div>
  );
} 