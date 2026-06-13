import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/common/PageHeader';
import { useAdminPermissions } from '@/hooks/admin/use-admin-permissions';
import { useToast } from '@/hooks/use-toast';
import {
  fetchStaffUsers,
  updateUserRole,
  type StaffUser,
} from '@/lib/api/users-admin';
import { ROLE_LABELS } from '@/constants/admin-permissions';

const ASSIGNABLE_ROLES = ['user', 'teacher', 'admin'] as const;

export default function AdminRoles() {
  const { canManageRoles } = useAdminPermissions();
  const { toast } = useToast();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!canManageRoles) return;
    fetchStaffUsers()
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        toast({
          variant: 'destructive',
          title: '목록 로드 실패',
          description: err instanceof Error ? err.message : '다시 시도해주세요.',
        });
      })
      .finally(() => setLoading(false));
  }, [canManageRoles, toast]);

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast({
        title: '권한 변경 완료',
        description: `${updated.email} → ${ROLE_LABELS[role] || role}`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '권한 변경 실패',
        description: err instanceof Error ? err.message : '다시 시도해주세요.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!canManageRoles) {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return (
      <div className="page-container text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">사용자 목록 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="권한 관리"
        subtitle={`${users.length}명 · admin만 teacher/admin 권한 부여`}
        backTo="/admin"
        backLabel="대시보드"
      />

      <Card className="bg-gray-900 border-gray-800 mb-4">
        <CardContent className="card-pad text-sm text-gray-400 space-y-2">
          <p className="flex items-center gap-2 text-white font-medium">
            <Shield className="h-4 w-4 text-purple-400" />
            권한 안내
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
            <li>
              <strong className="text-purple-300">admin</strong> — 전체 메뉴 + 권한 부여
            </li>
            <li>
              <strong className="text-cyan-300">teacher</strong> — 대시보드 · 신청 · 졸업면담 (선생님 CRUD 불가)
            </li>
            <li>
              <strong className="text-gray-300">user</strong> — 일반 회원 (관리 기능 없음)
            </li>
          </ul>
          <p className="text-xs text-gray-500 pt-1">
            관리자 페이지 입장 비밀번호(game1234)는 모든 staff 공통입니다.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="bg-gray-900 border-gray-800">
            <CardContent className="card-pad flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{u.email}</p>
                <p className="text-xs text-gray-500 truncate">
                  {u.name || '이름 없음'} · ID: {u.id.slice(0, 12)}…
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs hidden sm:inline-flex">
                  {ROLE_LABELS[u.role] || u.role}
                </Badge>
                <Select
                  value={u.role}
                  disabled={updatingId === u.id}
                  onValueChange={(v) => handleRoleChange(u.id, v)}
                >
                  <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-gray-300 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
