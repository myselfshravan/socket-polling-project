export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  name: string;
  role: UserRole;
}

export interface TokenPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface SessionData {
  user: User;
  token: string;
}