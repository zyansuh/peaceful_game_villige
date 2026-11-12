import { apiFetch } from '@/lib/api/auth-session';
import { ROLE_LABELS } from '@/constants/admin-permissions';
import type { AuthUser } from '@/types/auth';

export interface DirectoryMember {
  id: string;
  name?: string;
  discord_username?: string;
  discord_global_name?: string;
  discord_guild_nickname?: string;
  discord_avatar?: string;
  display_name?: string;
  role: string;
  nickname_configured?: boolean;
  created_at?: string;
  last_login?: string;
}

interface UserListResponse {
  items: DirectoryMember[];
  total: number;
}

export async function fetchMemberDirectory(search?: string): Promise<DirectoryMember[]> {
  const qs = search?.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
  const res = await apiFetch<UserListResponse>(`/api/v1/users/directory${qs}`);
  return Array.isArray(res?.items) ? res.items : [];
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

export type { AuthUser };
