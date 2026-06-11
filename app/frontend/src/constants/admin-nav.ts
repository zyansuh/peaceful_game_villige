import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AdminNavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin', label: '대시보드', icon: LayoutDashboard },
  { path: '/admin/applications', label: '신청 관리', icon: ClipboardList },
  { path: '/admin/teachers', label: '선생님 관리', icon: Users },
  { path: '/admin/interviews', label: '졸업면담 관리', icon: FileText },
];
