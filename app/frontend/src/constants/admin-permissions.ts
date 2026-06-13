export type AdminPermission =
  | 'dashboard'
  | 'applications'
  | 'teachers'
  | 'interviews'
  | 'roles';

export type StaffRole = 'admin' | 'teacher';

export const STAFF_ROLES: StaffRole[] = ['admin', 'teacher'];

export const ROLE_LABELS: Record<string, string> = {
  user: '일반 회원',
  teacher: '스태프 (teacher)',
  admin: '최고 관리자 (admin)',
};

/** admin 패널 메뉴·기능별 접근 권한 */
export const ROLE_PERMISSIONS: Record<StaffRole | 'user', AdminPermission[]> = {
  admin: ['dashboard', 'applications', 'teachers', 'interviews', 'roles'],
  teacher: ['dashboard', 'applications', 'interviews'],
  user: [],
};

export function canAccess(role: string | undefined, permission: AdminPermission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as StaffRole | 'user'];
  return perms?.includes(permission) ?? false;
}

export function isStaffRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'teacher';
}

export function isAdminRole(role: string | undefined): boolean {
  return role === 'admin';
}
