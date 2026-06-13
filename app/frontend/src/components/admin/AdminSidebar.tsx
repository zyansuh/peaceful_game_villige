import { Link, useLocation } from 'react-router-dom';
import { Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS } from '@/constants/admin-nav';
import { useAdminPermissions } from '@/hooks/admin/use-admin-permissions';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  isMobile = false,
  open = true,
  onClose,
}: AdminSidebarProps) {
  const location = useLocation();
  const { can, role } = useAdminPermissions();
  const visibleItems = ADMIN_NAV_ITEMS.filter((item) => can(item.permission));

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <aside
      className={cn(
        'w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col',
        isMobile && 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
        isMobile && !open && '-translate-x-full',
        isMobile && open && 'translate-x-0'
      )}
    >
      <div className="p-4 border-b border-gray-800 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">관리자</h2>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {role === 'admin' ? '최고 관리자' : role === 'teacher' ? '스태프' : '평화로운게임마을'}
          </p>
        </div>
        {isMobile && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800 shrink-0"
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="px-3 pt-3">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 transition-colors"
        >
          <Home className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">메인으로 돌아가기</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-purple-400' : 'text-gray-500')} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
