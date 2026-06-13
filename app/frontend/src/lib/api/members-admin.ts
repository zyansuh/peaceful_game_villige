import client from '@/lib/client';

export interface AdminMember {
  id: number;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchAllMembers(): Promise<AdminMember[]> {
  const res = await client.entities.members.queryAll({
    query: {},
    sort: '-created_at',
    limit: 2000,
  });
  const items = res?.data?.items ?? res?.data ?? [];
  return (Array.isArray(items) ? items : []).map((m: AdminMember) => ({
    id: m.id,
    username: m.username,
    created_at: m.created_at,
    updated_at: m.updated_at,
  }));
}
