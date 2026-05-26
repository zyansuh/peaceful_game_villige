import { useState, useEffect, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ADMIN_PASSWORD = 'game1234';
const SESSION_KEY = 'admin_authenticated';

interface AdminPasswordGateProps {
  children: ReactNode;
}

export default function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-white mb-2">관리자 인증</h2>
            <p className="text-gray-400 text-sm">관리자 페이지에 접근하려면 비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">관리자 비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="비밀번호를 입력하세요"
                className="bg-gray-800 border-gray-700 text-white mt-1"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
            >
              확인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}