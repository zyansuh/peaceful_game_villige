import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '@/lib/client';
import SpaceBackground from '@/components/layout/SpaceBackground';
import SiteHeader from '@/components/layout/SiteHeader';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await client.auth.me();
        if (res?.data) {
          setUser(res.data);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <SpaceBackground />
      <SiteHeader user={user} onLogout={handleLogout} />
      <main className="relative z-10 min-w-0">{children}</main>
    </div>
  );
}
