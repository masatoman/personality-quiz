import fs from 'fs';
import path from 'path';
import { PersonalityType, TypeTotals, TypeStats, Stats } from '@/types/quiz';
import { Pool } from 'pg';

// PostgreSQLの接続プール設定
let pool: Pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? {
          rejectUnauthorized: false
        }
      : false
  });
  
  // 接続のテスト
  pool.on('error', (err) => {
    console.error('PostgreSQL接続エラー:', err);
    console.log('ローカルファイルシステムのデータにフォールバックします');
  });
} catch (error) {
  console.error('PostgreSQLプールの初期化に失敗しました:', error);
  console.log('ローカルファイルシステムのデータにフォールバックします');
}

export async function query(text: string, params?: any[]) {
  try {
    // PostgreSQLへの接続を試みる
    if (pool) {
      const client = await pool.connect();
      try {
        return await client.query(text, params);
      } finally {
        client.release();
      }
    } else {
      throw new Error('PostgreSQLプールが利用できません');
    }
  } catch (error) {
    console.error('クエリ実行中にエラーが発生:', error);
    // エラーを投げて呼び出し元で処理する
    throw error;
  }
}

// データベースファイルのパス
const DB_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DB_DIR, 'results.json');
const STATS_FILE = path.join(DB_DIR, 'stats.json');

// データベースの初期化
export function initDatabase() {
  try {
    console.log(`データディレクトリパス: ${DB_DIR}`);
    console.log(`結果ファイルパス: ${RESULTS_FILE}`);
    console.log(`統計ファイルパス: ${STATS_FILE}`);
    
    // データディレクトリの作成
    if (!fs.existsSync(DB_DIR)) {
      console.log('データディレクトリが存在しないため、作成します');
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (dirError) {
        console.error('データディレクトリの作成に失敗しました:', dirError);
        console.log('代わりにメモリ内のモックデータを使用します');
        return true; // ファイルシステムにアクセスできなくても処理を続行
      }
    }

    // 結果ファイルの作成・確認
    if (!fs.existsSync(RESULTS_FILE)) {
      console.log('結果ファイルが存在しないため、作成します');
      fs.writeFileSync(RESULTS_FILE, JSON.stringify([]), { encoding: 'utf8', mode: 0o666 });
    }

    // 統計ファイルの作成・確認
    if (!fs.existsSync(STATS_FILE)) {
      console.log('統計ファイルが存在しないため、作成します');
      const initialStats: Stats = {
        giver: { count: 0, percentage: 0 },
        matcher: { count: 0, percentage: 0 },
        taker: { count: 0, percentage: 0 },
        total: 0
      };
      fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats), { encoding: 'utf8', mode: 0o666 });
    }
    
    return true;
  } catch (error) {
    console.error('データベースの初期化中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// メモリ内のモックデータ
let mockResults: { id: number; type: PersonalityType; timestamp: string }[] = [];
let mockStats: Stats = {
  giver: { count: 10, percentage: 34 },
  matcher: { count: 7, percentage: 25 },
  taker: { count: 12, percentage: 41 },
  total: 29
};

// 結果の保存
export function saveResult(type: PersonalityType): boolean {
  try {
    // データベースの初期化
    const initSuccess = initDatabase();
    if (!initSuccess) {
      console.log('データベース初期化に失敗しました。メモリ内のモックデータを使用します');
    }

    // ファイルへの保存を試みる
    try {
      console.log(`結果ファイルから読み込みを試行: ${RESULTS_FILE}`);
      // 現在の結果を読み込む
      let resultsData = [];
      try {
        const fileContent = fs.readFileSync(RESULTS_FILE, 'utf-8');
        console.log(`読み込まれたファイル内容: ${fileContent}`);
        resultsData = JSON.parse(fileContent);
      } catch (readError) {
        console.error('結果ファイルの読み込みに失敗しました。新しいファイルを作成します:', readError);
        resultsData = [];
      }
      
      // 新しい結果を追加
      const newResult = {
        id: Date.now(),
        type,
        timestamp: new Date().toISOString()
      };
      resultsData.push(newResult);
      
      console.log(`結果ファイルへの書き込みを試行: ${JSON.stringify(resultsData, null, 2)}`);
      // 結果を保存
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(resultsData, null, 2), { encoding: 'utf8', mode: 0o666 });
      
      // 統計を更新
      const statsSuccess = updateStats(type);
      if (!statsSuccess) {
        throw new Error('統計の更新に失敗しました');
      }
    } catch (fileError) {
      console.error('ファイルへの保存に失敗しました。メモリ内モックデータを更新します:', fileError);
      
      // メモリ内のモックデータを更新
      const newResult = {
        id: Date.now(),
        type,
        timestamp: new Date().toISOString()
      };
      mockResults.push(newResult);
      
      // モックの統計を更新
      mockStats[type].count += 1;
      mockStats.total += 1;
      
      // パーセンテージを再計算
      Object.keys(mockStats).forEach((key) => {
        if (key !== 'total') {
          const personalityType = key as PersonalityType;
          mockStats[personalityType].percentage = 
            Math.round((mockStats[personalityType].count / mockStats.total) * 100);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('結果の保存中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// 統計の更新
function updateStats(type: PersonalityType): boolean {
  try {
    console.log(`統計ファイルから読み込みを試行: ${STATS_FILE}`);
    // 統計データを読み込む
    let statsData: Stats;
    try {
      const fileContent = fs.readFileSync(STATS_FILE, 'utf-8');
      console.log(`読み込まれた統計ファイル内容: ${fileContent}`);
      statsData = JSON.parse(fileContent);
    } catch (readError) {
      console.error('統計ファイルの読み込みに失敗しました。新しい統計を作成します:', readError);
      statsData = {
        giver: { count: 0, percentage: 0 },
        matcher: { count: 0, percentage: 0 },
        taker: { count: 0, percentage: 0 },
        total: 0
      };
    }
    
    // カウントを増やす
    statsData[type].count += 1;
    statsData.total += 1;
    
    // パーセンテージを再計算
    const total = statsData.total;
    Object.keys(statsData).forEach((key) => {
      if (key !== 'total') {
        const personalityType = key as PersonalityType;
        statsData[personalityType].percentage = 
          Math.round((statsData[personalityType].count / total) * 100);
      }
    });
    
    console.log(`統計ファイルへの書き込みを試行: ${JSON.stringify(statsData, null, 2)}`);
    // 統計を保存
    fs.writeFileSync(STATS_FILE, JSON.stringify(statsData, null, 2), { encoding: 'utf8', mode: 0o666 });
    return true;
  } catch (error) {
    console.error('統計の更新中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    return false;
  }
}

// 統計の取得
export function getStats(): Stats {
  try {
    // データベースの初期化
    const initSuccess = initDatabase();
    if (!initSuccess) {
      console.log('データベース初期化に失敗しました。メモリ内のモックデータを使用します');
      return mockStats;
    }
    
    // ファイルからの読み込みを試みる
    try {
      console.log(`統計ファイルから読み込みを試行: ${STATS_FILE}`);
      const fileContent = fs.readFileSync(STATS_FILE, 'utf-8');
      console.log(`読み込まれた統計ファイル内容: ${fileContent}`);
      return JSON.parse(fileContent);
    } catch (readError) {
      console.error('統計ファイルの読み込みに失敗しました。メモリ内モックデータを返します:', readError);
      return mockStats;
    }
  } catch (error) {
    console.error('統計の取得中にエラーが発生しました:', error);
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    // エラー時はモックデータを返す
    return mockStats;
  }
} 