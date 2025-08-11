export interface User {
  id: string;
  email?: string;
  username?: string;
  profile?: UserProfile;
  role?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  personality_type?: 'giver' | 'matcher' | 'taker';
  giver_score?: number;
  giver_level?: number;
  points?: number;
  level?: number;
  badges?: string[];
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signUp: (email: string, password: string, options?: { username?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  // 開発環境用の機能
  devSwitchUser?: (userId: string | null) => Promise<void>;
  devUsers?: User[];
  isDevMode?: boolean;
} 