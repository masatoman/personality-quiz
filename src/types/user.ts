export interface UserProfile {
  role: 'user' | 'admin' | 'editor';
  displayName?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt?: string;
  updatedAt?: string;
  score?: number;
  personalityType?: string;
}

export type UserRole = UserProfile['role']; 