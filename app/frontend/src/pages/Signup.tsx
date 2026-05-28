import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import client from '@/lib/client';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      setError('평겜마 닉네임을 입력해주세요.');
      return false;
    }
    if (username.trim().length < 2) {
      setError('닉네임은 2자 이상이어야 합니다.');
      return false;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    if (password.length !== 4) {
      setError('비밀번호는 정확히 4자리여야 합니다.');
      return false;
    }
    if (!/^\d{4}$/.test(password)) {
      setError('비밀번호는 숫자 4자리만 입력 가능합니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Store the registration data via backend API
      await client.apiCall.invoke({
        url: '/api/v1/entities/members/register',
        method: 'POST',
        data: {
          username: username.trim(),
          password: password,
        },
      });

      // Redirect to login after successful registration
      navigate('/signup-complete');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              회원가입
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              평화로운게임마을에 오신 것을 환영합니다!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300 text-sm font-medium">
                평겜마 닉네임
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="사용할 닉네임을 입력하세요"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                비밀번호 (숫자 4자리)
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  // Only allow numeric input, max 4 chars
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPassword(val);
                  setError('');
                }}
                placeholder="숫자 4자리를 입력하세요"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                inputMode="numeric"
                maxLength={4}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500">
                비밀번호는 숫자 4자리만 가능합니다.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-11 font-medium"
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => window.location.href = '/login'}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}