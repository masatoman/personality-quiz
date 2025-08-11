// データ収集システム
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface BehaviorEvent {
  event_type: string;
  page_path?: string;
  element_id?: string;
  material_id?: string;
  section_index?: number;
  event_data?: Record<string, any>;
  duration_seconds?: number;
}

export interface LearningSession {
  material_id: string;
  started_at: Date;
  completed_at?: Date;
  last_position?: number;
  total_time_spent: number;
  quiz_attempts?: number;
  quiz_correct_answers?: number;
  quiz_total_questions?: number;
  difficulty_rating?: number;
  satisfaction_rating?: number;
  usefulness_rating?: number;
  is_completed: boolean;
  is_bookmarked?: boolean;
  will_recommend?: boolean;
}

export class DataCollector {
  private sessionId: string;
  private userId: string | null = null;
  private currentPath: string = '';
  private sessionStartTime: Date = new Date();
  private pageStartTime: Date = new Date();
  private learningSessionData: Map<string, Partial<LearningSession>> = new Map();

  constructor() {
    this.sessionId = uuidv4();
    this.initializeSession();
  }

  private async initializeSession() {
    // ユーザー認証状態の確認
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    // デバイス情報取得
    this.collectDeviceInfo();

    // ページ離脱時の処理
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // ページ遷移の監視
    this.setupNavigationTracking();

    // スクロール・クリックの監視
    this.setupInteractionTracking();
  }

  /**
   * 基本的な行動ログの記録
   */
  async logBehavior(event: BehaviorEvent) {
    if (!this.userId) return; // 未認証ユーザーは記録しない

    try {
      const deviceInfo = this.getDeviceInfo();
      
      await supabase.from('user_behavior_logs').insert({
        user_id: this.userId,
        session_id: this.sessionId,
        event_type: event.event_type,
        page_path: event.page_path || this.currentPath,
        element_id: event.element_id,
        material_id: event.material_id,
        section_index: event.section_index,
        event_data: event.event_data,
        duration_seconds: event.duration_seconds,
        device_type: deviceInfo.device_type,
        browser_type: deviceInfo.browser_type,
        screen_width: deviceInfo.screen_width,
        screen_height: deviceInfo.screen_height
      });
    } catch (error) {
      console.error('Failed to log behavior:', error);
    }
  }

  /**
   * ページビューの記録
   */
  async logPageView(path: string, materialId?: string) {
    // 前のページの滞在時間を記録
    if (this.currentPath) {
      const timeSpent = (Date.now() - this.pageStartTime.getTime()) / 1000;
      await this.logBehavior({
        event_type: 'page_leave',
        page_path: this.currentPath,
        duration_seconds: Math.round(timeSpent)
      });
    }

    // 新しいページビューを記録
    this.currentPath = path;
    this.pageStartTime = new Date();

    await this.logBehavior({
      event_type: 'page_view',
      page_path: path,
      material_id: materialId
    });
  }

  /**
   * 教材学習セッションの開始
   */
  async startLearningSession(materialId: string) {
    const sessionData: Partial<LearningSession> = {
      material_id: materialId,
      started_at: new Date(),
      total_time_spent: 0,
      is_completed: false
    };

    this.learningSessionData.set(materialId, sessionData);

    await this.logBehavior({
      event_type: 'learning_session_start',
      material_id: materialId
    });
  }

  /**
   * 教材学習セッションの更新
   */
  async updateLearningSession(materialId: string, updates: Partial<LearningSession>) {
    const existing = this.learningSessionData.get(materialId) || {};
    const updated = { ...existing, ...updates };
    this.learningSessionData.set(materialId, updated);

    // データベースに保存
    if (this.userId) {
      try {
        await supabase.from('material_learning_logs').upsert({
          user_id: this.userId,
          session_id: this.sessionId,
          material_id: materialId,
          started_at: updated.started_at,
          completed_at: updated.completed_at,
          last_position: updated.last_position,
          total_time_spent: updated.total_time_spent,
          quiz_attempts: updated.quiz_attempts,
          quiz_correct_answers: updated.quiz_correct_answers,
          quiz_total_questions: updated.quiz_total_questions,
          difficulty_rating: updated.difficulty_rating,
          satisfaction_rating: updated.satisfaction_rating,
          usefulness_rating: updated.usefulness_rating,
          is_completed: updated.is_completed,
          is_bookmarked: updated.is_bookmarked,
          will_recommend: updated.will_recommend
        }, {
          onConflict: 'user_id,material_id,session_id'
        });
      } catch (error) {
        console.error('Failed to update learning session:', error);
      }
    }
  }

  /**
   * 教材完了の記録
   */
  async completeLearningSession(materialId: string, ratings: {
    difficulty?: number;
    satisfaction?: number;
    usefulness?: number;
    will_recommend?: boolean;
  }) {
    await this.updateLearningSession(materialId, {
      completed_at: new Date(),
      is_completed: true,
      ...ratings
    });

    await this.logBehavior({
      event_type: 'learning_session_complete',
      material_id: materialId,
      event_data: ratings
    });
  }

  /**
   * クイズ結果の記録
   */
  async logQuizResult(materialId: string, result: {
    correct_answers: number;
    total_questions: number;
    time_taken: number;
    score: number;
  }) {
    const existing = this.learningSessionData.get(materialId) || {};
    const attempts = (existing.quiz_attempts || 0) + 1;

    await this.updateLearningSession(materialId, {
      quiz_attempts: attempts,
      quiz_correct_answers: result.correct_answers,
      quiz_total_questions: result.total_questions
    });

    await this.logBehavior({
      event_type: 'quiz_completed',
      material_id: materialId,
      duration_seconds: result.time_taken,
      event_data: {
        attempt_number: attempts,
        score: result.score,
        correct_answers: result.correct_answers,
        total_questions: result.total_questions
      }
    });
  }

  /**
   * コメント投稿の記録
   */
  async logCommentPosted(materialId: string, commentData: {
    comment_length: number;
    parent_comment_id?: string;
    time_to_write: number;
  }) {
    await this.logBehavior({
      event_type: 'comment_posted',
      material_id: materialId,
      duration_seconds: commentData.time_to_write,
      event_data: {
        comment_length: commentData.comment_length,
        is_reply: !!commentData.parent_comment_id,
        parent_comment_id: commentData.parent_comment_id
      }
    });
  }

  /**
   * ハート（役立った）投票の記録
   */
  async logHelpfulVote(materialId: string, commentId: string, isHelpful: boolean) {
    await this.logBehavior({
      event_type: 'helpful_vote',
      material_id: materialId,
      element_id: commentId,
      event_data: {
        is_helpful: isHelpful,
        vote_type: 'comment_helpful'
      }
    });
  }

  /**
   * スクロール深度の記録
   */
  async logScrollDepth(materialId: string, depth: number) {
    await this.logBehavior({
      event_type: 'scroll_depth',
      material_id: materialId,
      event_data: {
        scroll_depth_percent: depth,
        max_scroll: Math.max(depth, this.getMaxScrollDepth())
      }
    });
  }

  /**
   * 要素クリックの記録
   */
  async logElementClick(elementId: string, elementType: string, materialId?: string) {
    await this.logBehavior({
      event_type: 'element_click',
      element_id: elementId,
      material_id: materialId,
      event_data: {
        element_type: elementType,
        click_timestamp: Date.now()
      }
    });
  }

  /**
   * 検索行動の記録
   */
  async logSearch(searchQuery: string, resultCount: number, category?: string) {
    await this.logBehavior({
      event_type: 'search_performed',
      event_data: {
        search_query: searchQuery,
        result_count: resultCount,
        category: category,
        query_length: searchQuery.length
      }
    });
  }

  /**
   * ナビゲーショントラッキングの設定
   */
  private setupNavigationTracking() {
    // History API の監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.onNavigationChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.onNavigationChange();
    };

    // popstate イベントの監視
    window.addEventListener('popstate', () => {
      this.onNavigationChange();
    });
  }

  /**
   * インタラクション（クリック・スクロール）トラッキングの設定
   */
  private setupInteractionTracking() {
    // クリックイベント
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.className || target.tagName;
      const materialId = this.extractMaterialIdFromPath();
      
      this.logElementClick(elementId, target.tagName.toLowerCase(), materialId);
    });

    // スクロールイベント（スロットル済み）
    let scrollTimeout: ReturnType<typeof setTimeout>;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const depth = this.calculateScrollDepth();
        const materialId = this.extractMaterialIdFromPath();
        if (materialId && depth > 0) {
          this.logScrollDepth(materialId, depth);
        }
      }, 1000);
    });
  }

  /**
   * デバイス情報の収集
   */
  private collectDeviceInfo() {
    // サーバーサイドレンダリング中は実行しない
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // 基本的なデバイス情報を収集してセッションの開始を記録
    this.logBehavior({
      event_type: 'session_start',
      event_data: {
        user_agent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      }
    });
  }

  /**
   * ナビゲーション変更時の処理
   */
  private onNavigationChange() {
    const newPath = window.location.pathname;
    const materialId = this.extractMaterialIdFromPath();
    this.logPageView(newPath, materialId);
  }

  /**
   * URLから教材IDを抽出
   */
  private extractMaterialIdFromPath(): string | undefined {
    const match = window.location.pathname.match(/\/materials\/([a-f0-9-]+)/);
    return match ? match[1] : undefined;
  }

  /**
   * スクロール深度の計算
   */
  private calculateScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrollTop / documentHeight) * 100);
  }

  /**
   * 最大スクロール深度の取得
   */
  private getMaxScrollDepth(): number {
    return parseInt(sessionStorage.getItem('maxScrollDepth') || '0');
  }

  /**
   * デバイス情報の取得
   */
  private getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    let device_type = 'desktop';
    
    if (/tablet|ipad/.test(userAgent)) {
      device_type = 'tablet';
    } else if (/mobile|phone|android|iphone/.test(userAgent)) {
      device_type = 'mobile';
    }

    const browser_type = this.getBrowserType(userAgent);

    return {
      device_type,
      browser_type,
      screen_width: screen.width,
      screen_height: screen.height
    };
  }

  /**
   * ブラウザタイプの判定
   */
  private getBrowserType(userAgent: string): string {
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'other';
  }

  /**
   * セッション終了処理
   */
  private async endSession() {
    const sessionDuration = (Date.now() - this.sessionStartTime.getTime()) / 1000;
    
    await this.logBehavior({
      event_type: 'session_end',
      duration_seconds: Math.round(sessionDuration),
      event_data: {
        total_pages_visited: sessionStorage.getItem('pagesVisited') || '1',
        total_materials_viewed: this.learningSessionData.size
      }
    });
  }
}

// グローバルインスタンス
export const dataCollector = new DataCollector();
