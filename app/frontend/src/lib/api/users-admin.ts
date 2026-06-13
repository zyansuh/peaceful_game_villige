export interface StaffUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  last_login?: string;
}

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const res = await fetch('/api/v1/users/staff', { credentials: 'include' });
  if (!res.ok) {
    throw new Error('사용자 목록을 불러오지 못했습니다.');
  }
  const data = await res.json();
  return data.items || [];
}

export async function updateUserRole(userId: string, role: string): Promise<StaffUser> {
  const res = await fetch(`/api/v1/users/staff/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || '권한 변경에 실패했습니다.');
  }
  return res.json();
}
