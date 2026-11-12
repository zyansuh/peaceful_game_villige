import { useEffect, useState } from 'react';
import { Check, Loader2, Pencil, RotateCcw, Search, UserCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { adminClearNickname, adminUpdateNickname } from '@/lib/api/users-admin';
import {
  fetchMemberDirectory,
  roleLabel,
  type DirectoryMember,
} from '@/lib/api/members-admin';
import { getDisplayNickname } from '@/lib/nickname';

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

function applyUpdated(m: DirectoryMember, updated: Partial<DirectoryMember>): DirectoryMember {
  return {
    ...m,
    name: updated.name,
    nickname_configured: updated.nickname_configured,
    display_name: updated.display_name,
    discord_guild_nickname: updated.discord_guild_nickname ?? m.discord_guild_nickname,
    discord_global_name: updated.discord_global_name ?? m.discord_global_name,
    discord_username: updated.discord_username ?? m.discord_username,
  };
}

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadMembers = (q?: string) => {
    setLoading(true);
    fetchMemberDirectory(q)
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
    setEditValue(m.nickname_configured ? m.name || '' : getDisplayNickname(m));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveNickname = async (userId: string) => {
    setSavingId(userId);
    try {
      const updated = await adminUpdateNickname(userId, editValue);
      setMembers((prev) => prev.map((m) => (m.id === userId ? applyUpdated(m, updated) : m)));
      setEditingId(null);
      toast({ title: '관리자 지정 닉네임이 저장되었습니다.' });
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

  const clearNickname = async (userId: string) => {
    setSavingId(userId);
    try {
      const updated = await adminClearNickname(userId);
      setMembers((prev) => prev.map((m) => (m.id === userId ? applyUpdated(m, updated) : m)));
      setEditingId(null);
      toast({ title: '지정 닉네임을 초기화했습니다. 서버 닉네임으로 표시됩니다.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '초기화 실패',
        description: err instanceof Error ? err.message : '다시 시도해주세요.',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="회원 목록"
        subtitle={`총 ${members.length}명 · Discord 로그인 회원`}
        backTo="/admin"
        backLabel="대시보드"
      />

      <Card className="bg-gray-900 border-gray-800 mb-4">
        <CardContent className="card-pad text-sm text-gray-400 space-y-3">
          <p className="flex items-center gap-2 text-white font-medium">
            <UserCircle className="h-4 w-4 text-cyan-400" />
            닉네임 표시 우선순위
          </p>
          <p className="text-xs sm:text-sm">
            관리자 지정 → 평겜마 서버 닉 → Discord 표시 이름 → Discord username
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadMembers(search)}
                placeholder="지정닉 / 서버닉 / 표시이름 / username / Discord ID"
                className="pl-9 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-300"
              onClick={() => loadMembers(search)}
            >
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">회원 목록 로딩 중...</p>
        </div>
      ) : members.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="card-pad text-center text-gray-500 text-sm py-10">
            등록된 회원이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">표시 닉네임</th>
                <th className="px-4 py-3 font-medium">서버/Discord</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">권한</th>
                <th className="px-4 py-3 font-medium">가입/로그인</th>
                <th className="px-4 py-3 font-medium w-28">관리</th>
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
                        <span>
                          {getDisplayNickname(m)}
                          {m.nickname_configured && (
                            <span className="ml-1 text-[10px] text-amber-400/80">지정</span>
                          )}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <div>서버: {m.discord_guild_nickname || '-'}</div>
                    <div>표시: {m.discord_global_name || '-'}</div>
                    <div>@{m.discord_username || m.id}</div>
                  </td>
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
                          className="h-8 w-8 text-amber-400"
                          disabled={savingId === m.id}
                          onClick={() => clearNickname(m.id)}
                          title="지정 닉네임 초기화"
                        >
                          <RotateCcw className="h-4 w-4" />
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
