/**
 * Supabaseデータベース型定義
 * モックテスト用の最小限の定義
 */
export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string;
          materialId: string;
          userId: string;
          rating: number;
          comment: string;
          createdAt: string;
        };
        Insert: {
          materialId: string;
          userId: string;
          rating: number;
          comment: string;
          createdAt?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
      };
      materials: {
        Row: {
          id: string;
          title: string;
          description: string;
          content: string;
          difficulty: string;
          authorId: string;
        };
      };
      // 他のテーブル定義...
      [key: string]: any;
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      [key: string]: any;
    };
  };
}; 