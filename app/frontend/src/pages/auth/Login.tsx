import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import client from '@/lib/client';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await client.apiCall.invoke({
        url: '/api/v1/auth/member-login',
        method: 'POST',
        data: { username: username.trim(), password: password.trim() },
      });

      const token = res.data?.token;
      if (!token) {
        setError('로그인에 실패했습니다.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('isLougOutManual', 'false');
      navigate('/');
      window.location.reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '로그인에 실패했습니다. 다시 시도해주세요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-6">
      <Card className="w-full max-w-md bg-gray-900/80 border-gray-700 backdrop-blur-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            로그인
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 truncate">평화로운게임마을</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">평겜마 닉네임</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">비밀번호 (숫자 4자리)</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                maxLength={4}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="text-center text-sm text-gray-400">
              아직 계정이 없으신가요?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 underline">
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}