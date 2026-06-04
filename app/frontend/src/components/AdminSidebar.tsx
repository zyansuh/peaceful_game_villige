import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin', label: '대시보드', icon: LayoutDashboard },
  { path: '/admin/applications', label: '신청 관리', icon: ClipboardList },
  { path: '/admin/teachers', label: '선생님 관리', icon: Users },
  { path: '/admin/interviews', label: '졸업면담 관리', icon: FileText },
];

export default function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">🎮 관리자</h2>
        <p className="text-xs text-gray-500 mt-1">평화로운게임마을</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-purple-400' : 'text-gray-500')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4 text-gray-500" />
          메인으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}