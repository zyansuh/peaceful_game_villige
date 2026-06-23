import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { updateNickname } from '@/lib/api/profile';

export default function SetupNickname() {
  const navigate = useNavigate();
  const { user, loading, refetch } = useAuth();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.nickname_configured && user.name) {
      navigate('/mypage', { replace: true });
      return;
    }
    setNickname(user.name || user.discord_username || '');
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateNickname(nickname);
      await refetch();
      navigate('/mypage', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '닉네임 설정에 실패했습니다.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-6">
      <Card className="w-full max-w-md bg-gray-900/80 border-gray-700 backdrop-blur-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-white">
            닉네임 설정
          </CardTitle>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            사이트에서 사용할 표시 이름을 입력해 주세요.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.discord_avatar && (
              <div className="flex justify-center">
                <img
                  src={user.discord_avatar}
                  alt=""
                  className="h-16 w-16 rounded-full border border-gray-700"
                />
              </div>
            )}
            {user.discord_username && (
              <p className="text-center text-xs text-gray-500">
                Discord: {user.discord_username}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="setup-nickname" className="text-gray-300">
                사이트 닉네임
              </Label>
              <Input
                id="setup-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="2~20자"
                className="bg-gray-800 border-gray-700 text-white"
                autoFocus
                required
              />
              <p className="text-xs text-gray-500">
                한글·영문·숫자·공백·_- . 사용 가능 (2~20자)
              </p>
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={saving || !nickname.trim()}
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                '완료하고 시작하기'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
