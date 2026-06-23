import { apiFetch } from '@/lib/api/auth-session';
import type { AuthUser } from '@/types/auth';

export async function updateNickname(nickname: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/v1/users/profile/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname: nickname.trim() }),
  });
}
