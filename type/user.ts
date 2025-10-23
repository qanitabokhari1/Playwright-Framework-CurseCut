// User credentials type
export interface UserCredentials {
  email: string;
  password: string;
  id: string;
}

// User session type
export interface UserSession {
  isAuthenticated: boolean;
  credits: number;
  user: UserCredentials;
  token?: string;
}

// User roles
export type UserRole = 'admin' | 'user' | 'trial';
