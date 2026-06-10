import type { UserRole } from './enums';

export interface User {
  id: string;
  contact_id: string;
  email: string;
  role: UserRole;
  last_login_at?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  role: UserRole;
  notes?: string;
  chatwoot_contact_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContext {
  user_id: string;
  contact_id: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}
