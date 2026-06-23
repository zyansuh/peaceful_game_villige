import { useEffect, useState } from 'react';
import { Check, Loader2, Pencil, UserCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { adminUpdateNickname } from '@/lib/api/users-admin';
import {
  fetchMemberDirectory,
  roleLabel,
  type DirectoryMember,
} from '@/lib/api/members-admin';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadMembers = () => {
    setLoading(true);
    fetchMemberDirectory()
      .then(setMembers)
      .catch((err) => {
        console.error(err);
        toast({
          variant: 'destructive',
          title: '회원 목록 로드 실패',
          description: err instanceof Error ? err.message : '다시 시도해주세요.',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (m: DirectoryMember) => {
    setEditingId(m.id);
    setEditValue(m.name || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveNickname = async (userId: string) => {
    setSavingId(userId);
    try {
      const updated = await adminUpdateNickname(userId, editValue);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === userId
            ? { ...m, name: updated.name, nickname_configured: updated.nickname_configured }
            : m
        )
      );
      setEditingId(null);
      toast({ title: '닉네임이 변경되었습니다.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '변경 실패',
        description: err instanceof Error ? err.message : '다시 시도해주세요.',
      });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">회원 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="회원 목록"
        subtitle={`총 ${members.length}명 · Discord 로그인 회원`}
        backTo="/admin"
        backLabel="대시보드"
      />

      <Card className="bg-gray-900 border-gray-800 mb-4">
        <CardContent className="card-pad text-sm text-gray-400 space-y-1">
          <p className="flex items-center gap-2 text-white font-medium">
            <UserCircle className="h-4 w-4 text-cyan-400" />
            안내
          </p>
          <p className="text-xs sm:text-sm">
            Discord로 로그인한 회원 목록입니다. 관리자는 아래에서 사이트 닉네임을 변경할 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {members.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="card-pad text-center text-gray-500 text-sm py-10">
            등록된 회원이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">사이트 닉네임</th>
                <th className="px-4 py-3 font-medium">Discord</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">권한</th>
                <th className="px-4 py-3 font-medium">가입/로그인</th>
                <th className="px-4 py-3 font-medium w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/40">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-white font-medium">
                    {editingId === m.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        maxLength={20}
                        className="h-8 bg-gray-800 border-gray-700 text-white text-sm max-w-[160px]"
                        autoFocus
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        {m.discord_avatar && (
                          <img src={m.discord_avatar} alt="" className="h-6 w-6 rounded-full" />
                        )}
                        {m.name || '(미설정)'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{m.discord_username || m.id}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs font-normal">
                      {roleLabel(m.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(m.last_login || m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === m.id ? (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-400"
                          disabled={savingId === m.id || !editValue.trim()}
                          onClick={() => saveNickname(m.id)}
                        >
                          {savingId === m.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400"
                          disabled={savingId === m.id}
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-white"
                        onClick={() => startEdit(m)}
                        aria-label="닉네임 수정"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
