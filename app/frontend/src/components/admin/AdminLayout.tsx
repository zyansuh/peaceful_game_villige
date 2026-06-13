import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminPasswordGate from '@/components/admin/AdminPasswordGate';
import AdminStaffGate from '@/components/admin/AdminStaffGate';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminPasswordGate>
      <AdminStaffGate>
        <div className="flex min-h-screen bg-gray-950">
          {isMobile && sidebarOpen && (
            <button
              type="button"
              aria-label="사이드바 닫기"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <AdminSidebar
            isMobile={isMobile}
            open={!isMobile || sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="flex-1 min-w-0 overflow-auto">
            {isMobile && (
              <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-800 bg-gray-950/95 px-4 py-3 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 shrink-0"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <span className="text-sm font-semibold text-white">관리자 메뉴</span>
              </div>
            )}
            {children}
          </main>
        </div>
      </AdminStaffGate>
    </AdminPasswordGate>
  );
}
