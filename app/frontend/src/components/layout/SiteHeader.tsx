import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Home,
  UserCircle,
  LogIn,
  LogOut,
  X,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  user: { name?: string; email?: string; discord_avatar?: string } | null;
  onLogout: () => void;
}

const navLinkClass =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors';

export default function SiteHeader({ user, onLogout }: SiteHeaderProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeAnd = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piwwehqaagxq/logo-peaceful-gaming-village.png"
            alt="로고"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shrink-0"
          />
          <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
            평화로운게임마을
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link to="/graduation-interview">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span className="text-oneline max-w-[7rem]">졸업면담</span>
            </Button>
          </Link>
          {user && (
            <Link to="/mypage">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white gap-1.5">
                {user.discord_avatar ? (
                  <img src={user.discord_avatar} alt="" className="h-5 w-5 rounded-full" />
                ) : (
                  <UserCircle className="h-4 w-4" />
                )}
                {user.name || '마이페이지'}
              </Button>
            </Link>
          )}
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              size="sm"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Discord 로그인
            </Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-700 text-gray-300 shrink-0"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100vw-2rem,280px)] bg-gray-950 border-gray-800 p-0">
            <SheetHeader className="border-b border-gray-800 p-4 text-left">
              <SheetTitle className="text-white text-base flex items-center justify-between">
                <span>메뉴</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="닫기">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3">
              <Link to="/" className={navLinkClass} onClick={() => setOpen(false)}>
                <Home className="h-4 w-4 text-blue-400" />
                홈
              </Link>
              <Link to="/graduation-interview" className={navLinkClass} onClick={() => setOpen(false)}>
                <ClipboardList className="h-4 w-4 text-purple-400" />
                졸업면담지
              </Link>
              {user && (
                <Link to="/mypage" className={navLinkClass} onClick={() => setOpen(false)}>
                  <UserCircle className="h-4 w-4 text-cyan-400" />
                  마이페이지
                </Link>
              )}
              <div className="my-2 border-t border-gray-800" />
              {user ? (
                <button
                  type="button"
                  className={cn(navLinkClass, 'w-full text-left')}
                  onClick={() => closeAnd(onLogout)}
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  로그아웃
                </button>
              ) : (
                <Link to="/login" className={navLinkClass} onClick={() => setOpen(false)}>
                  <LogIn className="h-4 w-4 text-green-400" />
                  Discord 로그인
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
