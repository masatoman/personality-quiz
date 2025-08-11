import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, AuthContextType } from '@/types/auth';
import { supabase } from '@/lib/supabase/client';

// 開発環境用のダミーユーザー
const DEV_USERS = [
  {
    id: 'dev-user-1',
    email: 'admin@example.com',
    profile: {
      id: 'dev-user-1',
      username: '管理者',
      display_name: '管理者ユーザー',
      bio: '管理者アカウント（開発用）',
      avatar_url: '/avatars/admin.png',
      personality_type: 'giver' as const,
      giver_score: 95,
      points: 5000,
      level: 10,
      badges: ['early_adopter', 'material_creator', 'top_contributor'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'dev-user-2',
    email: 'giver@example.com',
    profile: {
      id: 'dev-user-2',
      username: 'ギバー田中',
      display_name: 'ギバー田中',
      bio: 'みんなの学習をサポートしたいです！',
      avatar_url: '/avatars/giver.png',
      personality_type: 'giver' as const,
      giver_score: 85,
      points: 2500,
      level: 7,
      badges: ['helper', 'material_creator'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'dev-user-3',
    email: 'matcher@example.com',
    profile: {
      id: 'dev-user-3',
      username: 'マッチャー佐藤',
      display_name: 'マッチャー佐藤',
      bio: 'バランス重視で学習しています',
      avatar_url: '/avatars/matcher.png',
      personality_type: 'matcher' as const,
      giver_score: 65,
      points: 1200,
      level: 4,
      badges: ['balanced_learner'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'dev-user-4',
    email: 'taker@example.com',
    profile: {
      id: 'dev-user-4',
      username: 'テイカー山田',
      display_name: 'テイカー山田',
      bio: '効率的に学習したいです',
      avatar_url: '/avatars/taker.png',
      personality_type: 'taker' as const,
      giver_score: 35,
      points: 800,
      level: 2,
      badges: ['newcomer'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
];

// 開発環境かどうかをチェック
const isDevMode = () => {
  // クライアントサイドでの環境変数チェック
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  }
  // サーバーサイドでの環境変数チェック
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  // 開発環境用の機能
  devSwitchUser: async () => {},
  devUsers: DEV_USERS,
  isDevMode: isDevMode()
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    console.log('🔧 AuthContext: useEffect開始');
    console.log('🔧 AuthContext: NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 AuthContext: NEXT_PUBLIC_SKIP_AUTH:', process.env.NEXT_PUBLIC_SKIP_AUTH);
    console.log('🔧 AuthContext: isDevMode():', isDevMode());
    
    // 開発環境でSKIP_AUTHが有効な場合の初期化
    if (isDevMode()) {
      console.log('🚧 開発モード: 認証をスキップしてダミーユーザーを使用');
      
      // ローカルストレージから選択されたユーザーを取得
      const savedUserId = localStorage.getItem('dev-current-user-id');
      console.log('🔧 AuthContext: savedUserId:', savedUserId);
      
      const selectedUser = savedUserId 
        ? DEV_USERS.find(u => u.id === savedUserId) 
        : null; // デフォルトは未ログイン状態
      
      console.log('🔧 AuthContext: selectedUser:', selectedUser?.profile?.display_name);

      setState({
        user: selectedUser || null,
        loading: false,
        error: null,
      });
      return;
    }

    // 通常のSupabase認証フロー
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: {
              ...session.user,
              profile,
            },
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        setState({ user: null, loading: false, error: error as Error });
      }
    };

    initSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: {
              ...session.user,
              profile,
            },
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, loading: false, error: null });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const signInWithGithub = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const signUp = async (email: string, password: string, options?: { username?: string }): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: options?.username }
        }
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const signOut = async () => {
    if (isDevMode()) {
      // 開発環境では未ログイン状態に切り替え
      localStorage.removeItem('dev-current-user-id');
      setState({ user: null, loading: false, error: null });
      console.log('🚧 開発モード: ログアウト（未ログイン状態に切り替え）');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  };

  // 開発環境用のユーザー切り替え機能
  const devSwitchUser = async (userId: string | null) => {
    console.log('🔧 AuthContext: devSwitchUser called with userId:', userId);
    console.log('🔧 AuthContext: isDevMode():', isDevMode());
    
    if (!isDevMode()) {
      console.warn('devSwitchUser は開発環境でのみ利用可能です');
      return;
    }

    if (userId === null) {
      // 未ログイン状態に切り替え
      localStorage.removeItem('dev-current-user-id');
      setState({ user: null, loading: false, error: null });
      console.log('🚧 開発モード: 未ログイン状態に切り替え');
    } else {
      // 指定されたユーザーに切り替え
      const selectedUser = DEV_USERS.find(u => u.id === userId);
      console.log('🔧 AuthContext: selectedUser found:', !!selectedUser, selectedUser?.profile?.display_name);
      
      if (selectedUser) {
        localStorage.setItem('dev-current-user-id', userId);
        setState({ user: selectedUser, loading: false, error: null });
        console.log(`🚧 開発モード: ${selectedUser.profile.display_name} に切り替え`);
      } else {
        console.error('指定されたユーザーが見つかりません:', userId);
      }
    }
  };

  const value = {
    ...state,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signUp,
    signOut,
    // 開発環境用の機能
    devSwitchUser,
    devUsers: DEV_USERS,
    isDevMode: isDevMode()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 