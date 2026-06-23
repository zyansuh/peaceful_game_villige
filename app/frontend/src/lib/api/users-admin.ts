import { apiFetch } from '@/lib/api/auth-session';
import type { AuthUser } from '@/types/auth';

export interface StaffUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  last_login?: string;
}

interface UserListResponse {
  items: StaffUser[];
  total: number;
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const res = await apiFetch<UserListResponse>('/api/v1/users/staff');
  return res?.items || [];
}

export async function updateUserRole(userId: string, role: string): Promise<StaffUser> {
  return apiFetch<StaffUser>(`/api/v1/users/staff/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function adminUpdateNickname(userId: string, nickname: string): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/api/v1/users/staff/${encodeURIComponent(userId)}/nickname`, {
    method: 'PATCH',
    body: JSON.stringify({ nickname: nickname.trim() }),
  });
}
