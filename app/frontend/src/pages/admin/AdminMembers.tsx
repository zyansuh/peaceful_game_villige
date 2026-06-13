import { useEffect, useState } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { fetchAllMembers, type AdminMember } from '@/lib/api/members-admin';

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
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllMembers()
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
        subtitle={`총 ${members.length}명 · 회원가입(닉네임) 기준`}
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
            사이트 회원가입으로 등록된 닉네임 목록입니다. 비밀번호는 보안상 표시하지 않습니다.
          </p>
          <p className="text-xs text-gray-500">
            로그인·권한 변경은 <strong className="text-purple-300">권한 관리</strong> 메뉴에서 확인하세요.
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
          <table className="w-full text-sm text-left min-w-[360px]">
            <thead className="bg-gray-900/80 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-medium w-16">#</th>
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="px-4 py-3 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/40">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-500">{m.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{m.username}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(m.created_at)}
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
