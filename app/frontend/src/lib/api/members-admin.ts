import client from '@/lib/client';
import { ROLE_LABELS } from '@/constants/admin-permissions';

export interface DirectoryMember {
  id: string;
  name?: string;
  discord_username?: string;
  role: string;
  created_at?: string;
  last_login?: string;
}

export async function fetchMemberDirectory(): Promise<DirectoryMember[]> {
  const res = await client.apiCall.invoke({
    url: '/api/v1/users/directory',
    method: 'GET',
    data: {},
  });
  const items = res?.data?.items ?? [];
  return Array.isArray(items) ? items : [];
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}
