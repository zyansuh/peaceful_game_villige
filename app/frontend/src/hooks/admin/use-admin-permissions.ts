import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  type AdminPermission,
  canAccess,
  isAdminRole,
  isStaffRole,
} from '@/constants/admin-permissions';

export function useAdminPermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      role,
      isStaff: isStaffRole(role),
      isAdmin: isAdminRole(role),
      can: (permission: AdminPermission) => canAccess(role, permission),
      canManageTeachers: canAccess(role, 'teachers'),
      canManageRoles: canAccess(role, 'roles'),
    }),
    [role]
  );
}
