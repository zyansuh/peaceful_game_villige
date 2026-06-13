import { useEffect, useState } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';
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

  useEffect(() => {
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
  }, [toast]);

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
            Discord로 로그인한 회원 목록입니다. 사이트 닉네임은 마이페이지에서 변경할 수 있습니다.
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
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">사이트 닉네임</th>
                <th className="px-4 py-3 font-medium">Discord</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">권한</th>
                <th className="px-4 py-3 font-medium">가입/로그인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/40">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-white font-medium">{m.name || '(미설정)'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{m.discord_username || m.id}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs font-normal">
                      {roleLabel(m.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(m.last_login || m.created_at)}
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
