import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, ShieldAlert, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isStaffRole, ROLE_LABELS } from '@/constants/admin-permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminStaffGateProps {
  children: ReactNode;
}

/**
 * game1234 비밀번호 통과 후, 로그인 계정의 staff 권한(admin/teacher)을 확인합니다.
 */
export default function AdminStaffGate({ children }: AdminStaffGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-sm">계정 권한 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <LogIn className="h-10 w-10 text-cyan-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">로그인이 필요합니다</h2>
            <p className="text-gray-400 text-sm">
              관리자 페이지 기능을 사용하려면 먼저 사이트에 로그인해 주세요.
              <br />
              (회원가입한 닉네임·비밀번호로 로그인)
            </p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
            >
              <Link to="/login">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStaffRole(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardContent className="p-6 sm:p-8 text-center space-y-4">
            <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">관리 권한 없음</h2>
            <p className="text-gray-400 text-sm">
              이 계정은 관리자 패널 작업 권한이 없습니다.
              <br />
              최고 관리자(admin)에게 <strong className="text-cyan-300">teacher</strong> 또는{' '}
              <strong className="text-purple-300">admin</strong> 권한 부여를 요청하세요.
            </p>
            <div className="rounded-lg bg-gray-800/80 px-3 py-2 text-sm flex items-center justify-center gap-2 text-gray-300">
              <UserCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.name || user.email}</span>
              <span className="text-gray-500">·</span>
              <span>{ROLE_LABELS[user.role] || user.role}</span>
            </div>
            <Button asChild variant="outline" className="w-full border-gray-700 text-gray-300">
              <Link to="/">메인으로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
