export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  discord_username?: string;
  discord_avatar?: string;
  nickname_configured: boolean;
  role: string;
  last_login?: string;
  created_at?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: AuthUser | null;
}
