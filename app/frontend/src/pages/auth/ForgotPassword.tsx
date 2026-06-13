import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import client from '@/lib/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
      setError('새 비밀번호는 숫자 4자리여야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await client.apiCall.invoke({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        data: {
          username: trimmedUsername,
          new_password: newPassword,
        },
      });
      setSuccess('비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
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
            비밀번호 찾기
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            가입한 닉네임을 입력하고 새 비밀번호(숫자 4자리)를 설정하세요.
          </p>
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
                placeholder="가입한 닉네임"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">새 비밀번호 (숫자 4자리)</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setNewPassword(val);
                }}
                placeholder="새 비밀번호"
                maxLength={4}
                inputMode="numeric"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setConfirmPassword(val);
                }}
                placeholder="비밀번호 다시 입력"
                maxLength={4}
                inputMode="numeric"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-sm text-center">{success}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </Button>

            <div className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
