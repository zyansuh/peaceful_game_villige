export interface AuthUser {
  id: string;
  email: string;
  /** Custom site nickname when nickname_configured */
  name?: string;
  discord_username?: string;
  discord_global_name?: string;
  discord_guild_nickname?: string;
  discord_avatar?: string;
  nickname_configured: boolean;
  /** Computed display name (priority applied) */
  display_name?: string;
  role: string;
  last_login?: string;
  created_at?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: AuthUser | null;
}
