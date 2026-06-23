import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SpaceBackground from '@/components/layout/SpaceBackground';
import SiteHeader from '@/components/layout/SiteHeader';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <SpaceBackground />
      <SiteHeader
        user={user ? { name: user.name, email: user.email, discord_avatar: user.discord_avatar } : null}
        onLogout={handleLogout}
      />
      <main className="relative z-10 min-w-0 flex-1">{children}</main>
      <footer className="relative z-10 h-2 flex items-end justify-center pointer-events-none">
        <Link
          to="/admin"
          className="pointer-events-auto text-[6px] leading-none text-gray-950/20 hover:text-gray-800/30 select-none no-underline opacity-[0.04] hover:opacity-[0.12] transition-opacity duration-300"
          aria-hidden="true"
          tabIndex={-1}
        >
          관리자
        </Link>
      </footer>
    </div>
  );
}
