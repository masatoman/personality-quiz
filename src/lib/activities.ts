import { query } from './db';
import { ActivityType, ACTIVITY_POINTS, GIVER_IMPACT, Activity } from '@/types/activity';

// ローカルモードで動作する場合のファイルパスを設定
import fs from 'fs';
import path from 'path';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities.json');
const GIVER_SCORES_FILE = path.join(process.cwd(), 'data', 'giver_scores.json');

// アクティビティを記録する関数
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  referenceId?: string
): Promise<boolean> {
  try {
    const points = ACTIVITY_POINTS[activityType];
    const giverImpact = GIVER_IMPACT[activityType];
    const giverScoreChange = Math.round(points * giverImpact);

    // データベースへの記録を試みる
    try {
      // 1. アクティビティログの記録
      await query(
        `INSERT INTO activities (user_id, activity_type, reference_id, points)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, activityType, referenceId || null, points]
      );

      // 2. ユーザーの合計ポイントを更新
      await query(
        `UPDATE users 
         SET points = points + $1
         WHERE id = $2`,
        [points, userId]
      );

      // 3. ギバースコアの更新
      await query(
        `INSERT INTO giver_scores (user_id, score, last_updated)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           score = giver_scores.score + $2,
           last_updated = NOW()`,
        [userId, giverScoreChange]
      );

      return true;
    } catch (dbError) {
      console.error('データベースへの記録に失敗しました:', dbError);
      console.log('ローカルファイルに保存します');
      
      // ローカルファイルに保存
      return saveActivityLocally(userId, activityType, points, giverScoreChange, referenceId);
    }
  } catch (error) {
    console.error('アクティビティログの記録中にエラーが発生しました:', error);
    return false;
  }
}

// ローカルファイルにアクティビティを保存
function saveActivityLocally(
  userId: string,
  activityType: ActivityType,
  points: number,
  giverScoreChange: number,
  referenceId?: string
): boolean {
  try {
    // データディレクトリの確認
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 1. アクティビティログの保存
    let activities: Activity[] = [];
    try {
      if (fs.existsSync(ACTIVITIES_FILE)) {
        const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
        activities = JSON.parse(data);
      }
    } catch (readError) {
      console.error('アクティビティファイルの読み込みに失敗しました:', readError);
      activities = [];
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      userId,
      activityType,
      referenceId,
      points,
      createdAt: new Date().toISOString()
    };
    
    activities.push(newActivity);
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));

    // 2. ギバースコアの更新
    let giverScores: Record<string, number> = {};
    try {
      if (fs.existsSync(GIVER_SCORES_FILE)) {
        const data = fs.readFileSync(GIVER_SCORES_FILE, 'utf-8');
        giverScores = JSON.parse(data);
      }
    } catch (readError) {
      console.error('ギバースコアファイルの読み込みに失敗しました:', readError);
      giverScores = {};
    }

    giverScores[userId] = (giverScores[userId] || 0) + giverScoreChange;
    fs.writeFileSync(GIVER_SCORES_FILE, JSON.stringify(giverScores, null, 2));

    return true;
  } catch (error) {
    console.error('ローカルファイルへの保存に失敗しました:', error);
    return false;
  }
}

// ユーザーのギバースコアを取得
export async function getGiverScore(userId: string): Promise<number> {
  try {
    // データベースからのスコア取得を試みる
    try {
      const result = await query(
        `SELECT score FROM giver_scores WHERE user_id = $1`,
        [userId]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0].score;
      }
      
      // レコードが見つからない場合は0を返す
      return 0;
    } catch (dbError) {
      console.error('データベースからのスコア取得に失敗しました:', dbError);
      
      // ローカルファイルからの取得を試みる
      try {
        if (fs.existsSync(GIVER_SCORES_FILE)) {
          const data = fs.readFileSync(GIVER_SCORES_FILE, 'utf-8');
          const giverScores: Record<string, number> = JSON.parse(data);
          return giverScores[userId] || 0;
        }
      } catch (readError) {
        console.error('ギバースコアファイルの読み込みに失敗しました:', readError);
      }
      
      return 0;
    }
  } catch (error) {
    console.error('ギバースコアの取得中にエラーが発生しました:', error);
    return 0;
  }
}

// ユーザーのアクティビティ履歴を取得
export async function getUserActivities(userId: string, limit = 10): Promise<Activity[]> {
  try {
    // データベースからのアクティビティ取得を試みる
    try {
      const result = await query(
        `SELECT * FROM activities 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      
      return result.rows;
    } catch (dbError) {
      console.error('データベースからのアクティビティ取得に失敗しました:', dbError);
      
      // ローカルファイルからの取得を試みる
      try {
        if (fs.existsSync(ACTIVITIES_FILE)) {
          const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
          const activities: Activity[] = JSON.parse(data);
          return activities
            .filter((activity: Activity) => activity.userId === userId)
            .sort((a: Activity, b: Activity) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        }
      } catch (readError) {
        console.error('アクティビティファイルの読み込みに失敗しました:', readError);
      }
      
      return [];
    }
  } catch (error) {
    console.error('アクティビティの取得中にエラーが発生しました:', error);
    return [];
  }
} 