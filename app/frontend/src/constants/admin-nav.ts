import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AdminPermission } from '@/constants/admin-permissions';

export type AdminNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  permission: AdminPermission;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin', label: '대시보드', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/admin/applications', label: '신청 관리', icon: ClipboardList, permission: 'applications' },
  { path: '/admin/teachers', label: '선생님 관리', icon: Users, permission: 'teachers' },
  { path: '/admin/interviews', label: '졸업면담 관리', icon: FileText, permission: 'interviews' },
  { path: '/admin/roles', label: '권한 관리', icon: Shield, permission: 'roles' },
];
