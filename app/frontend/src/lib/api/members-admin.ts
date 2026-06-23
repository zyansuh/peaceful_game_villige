import { apiFetch } from '@/lib/api/auth-session';
import { ROLE_LABELS } from '@/constants/admin-permissions';

export interface DirectoryMember {
  id: string;
  name?: string;
  discord_username?: string;
  discord_avatar?: string;
  role: string;
  nickname_configured?: boolean;
  created_at?: string;
  last_login?: string;
}

interface UserListResponse {
  items: DirectoryMember[];
  total: number;
}

export async function fetchMemberDirectory(): Promise<DirectoryMember[]> {
  const res = await apiFetch<UserListResponse>('/api/v1/users/directory');
  return Array.isArray(res?.items) ? res.items : [];
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}
