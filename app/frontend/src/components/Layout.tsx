import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import client from '@/lib/client';
import SpaceBackground from '@/components/SpaceBackground';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<any>(null);
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

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <SpaceBackground />
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piwwehqaagxq/logo-peaceful-gaming-village.png"
              alt="Logo"
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              평화로운게임마을
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link to="/mypage">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  마이페이지
                </Button>
              </Link>
            )}
            {user && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  관리자
                </Button>
              </Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                로그아웃
              </Button>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    회원가입
                  </Button>
                </Link>
                <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  로그인
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}