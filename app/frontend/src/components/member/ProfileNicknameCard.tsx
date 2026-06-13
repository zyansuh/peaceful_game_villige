import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { updateNickname } from '@/lib/api/profile';
import { useToast } from '@/hooks/use-toast';

interface ProfileNicknameCardProps {
  initialName?: string;
  discordUsername?: string;
  onUpdated: (name: string) => void;
}

export default function ProfileNicknameCard({
  initialName = '',
  discordUsername,
  onUpdated,
}: ProfileNicknameCardProps) {
  const { toast } = useToast();
  const [nickname, setNickname] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateNickname(nickname);
      const newName = updated.name || nickname.trim();
      onUpdated(newName);
      toast({ title: '닉네임이 변경되었습니다.' });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        '닉네임 변경에 실패했습니다.';
      toast({ variant: 'destructive', title: '변경 실패', description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-gray-900/80 border-gray-800 mb-6">
      <CardContent className="card-pad space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">내 프로필</h2>
          {discordUsername && (
            <p className="text-xs text-gray-500 mt-1">Discord: {discordUsername}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="site-nickname" className="text-gray-300">
            사이트 표시 닉네임
          </Label>
          <Input
            id="site-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="2~20자"
            className="bg-gray-800 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500">한글·영문·숫자·공백·_- . 사용 가능 (2~20자)</p>
        </div>
        <Button
          type="button"
          disabled={saving || !nickname.trim()}
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0"
        >
          {saving ? '저장 중...' : '닉네임 저장'}
        </Button>
      </CardContent>
    </Card>
  );
}
