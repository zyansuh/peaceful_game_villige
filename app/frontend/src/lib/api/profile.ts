import client from '@/lib/client';

export interface UserProfile {
  id: string;
  name?: string;
  discord_username?: string;
  email?: string;
  role?: string;
}

export async function updateNickname(nickname: string): Promise<UserProfile> {
  const res = await client.apiCall.invoke({
    url: '/api/v1/users/profile/nickname',
    method: 'PATCH',
    data: { nickname: nickname.trim() },
  });
  return res.data;
}
