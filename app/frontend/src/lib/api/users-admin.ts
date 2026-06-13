export interface StaffUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  last_login?: string;
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const client = (await import('@/lib/client')).default;
  const res = await client.apiCall.invoke({
    url: '/api/v1/users/staff',
    method: 'GET',
    data: {},
  });
  return res?.data?.items || [];
}

export async function updateUserRole(userId: string, role: string): Promise<StaffUser> {
  const client = (await import('@/lib/client')).default;
  try {
    const res = await client.apiCall.invoke({
      url: `/api/v1/users/staff/${encodeURIComponent(userId)}/role`,
      method: 'PATCH',
      data: { role },
    });
    return res.data;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
      '권한 변경에 실패했습니다.';
    throw new Error(message);
  }
}
