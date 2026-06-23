import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchCurrentUser } from '@/lib/api/auth-session';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;

        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        if (!user.nickname_configured || !user.name) {
          navigate('/setup-nickname', { replace: true });
          return;
        }

        navigate('/mypage', { replace: true });
      } catch {
        if (!cancelled) {
          setError('로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            type="button"
            className="text-sm text-gray-400 underline hover:text-white"
            onClick={() => navigate('/login')}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
