import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, CheckCircle, XCircle, User, RefreshCw, Ban } from 'lucide-react';
import client from '@/lib/client';

interface Application {
  id: number;
  nickname: string;
  discord_id: string;
  teacher_id: number;
  class_name: string;
  status: string;
  created_at: string;
}

interface Teacher {
  id: number;
  nickname: string;
  position: string;
  tier: string;
  game_category: string;
}

export default function MyPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [teachers, setTeachers] = useState<Record<number, Teacher>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Application | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    try {
      const userRes = await client.auth.me();
      if (!userRes?.data) {
        client.auth.toLogin();
        return;
      }

      // Fetch user's applications
      const appRes = await client.entities.applications.list();
      const appList = appRes?.data || [];
      setApplications(appList);

      // Fetch teacher details for each application
      const teacherIds = [...new Set(appList.map((a: Application) => a.teacher_id))];
      const teacherMap: Record<number, Teacher> = {};
      for (const tid of teacherIds) {
        try {
          const tRes = await client.entities.teachers.get({ id: String(tid) });
          if (tRes?.data) {
            teacherMap[tid] = tRes.data;
          }
        } catch {
          // skip if teacher not found
        }
      }
      setTeachers(teacherMap);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCancelApplication = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await client.entities.applications.update({
        id: String(cancelTarget.id),
        data: { status: 'cancelled' },
      });
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === cancelTarget.id ? { ...app, status: 'cancelled' } : app
        )
      );
    } catch (err) {
      console.error('Failed to cancel application:', err);
      alert('신청 취소 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: '승인됨',
          icon: <CheckCircle className="w-4 h-4" />,
          className: 'bg-green-500/20 text-green-400 border-green-500/30',
        };
      case 'rejected':
        return {
          label: '거절됨',
          icon: <XCircle className="w-4 h-4" />,
          className: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'cancelled':
        return {
          label: '취소됨',
          icon: <Ban className="w-4 h-4" />,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };
      default:
        return {
          label: '대기중',
          icon: <Clock className="w-4 h-4" />,
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
    }
  };

  const getClassColor = (gameCategory: string) => {
    switch (gameCategory) {
      case 'overwatch': return 'text-blue-400';
      case 'pubg': return 'text-orange-400';
      case 'valorant': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getClassName = (gameCategory: string) => {
    switch (gameCategory) {
      case 'overwatch': return '수달반 (오버워치)';
      case 'pubg': return '사자반 (배그)';
      case 'valorant': return '여우반 (발로란트)';
      default: return gameCategory;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-700 mx-auto mb-4" />
          <div className="h-4 bg-gray-700 rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">마이페이지</h1>
            <p className="text-gray-400 text-sm">신청 현황을 확인하세요</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">신청 내역이 없습니다</h2>
            <p className="text-gray-400 mb-6">아직 담당 선생님을 신청하지 않으셨네요!</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              반 둘러보기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Status summary */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {applications.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-xs text-yellow-400/70">대기중</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">
                {applications.filter(a => a.status === 'approved').length}
              </p>
              <p className="text-xs text-green-400/70">승인됨</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
              <p className="text-xs text-red-400/70">거절됨</p>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-400">
                {applications.filter(a => a.status === 'cancelled').length}
              </p>
              <p className="text-xs text-gray-400/70">취소됨</p>
            </div>
          </div>

          {/* Application list */}
          {applications.map((app) => {
            const statusInfo = getStatusInfo(app.status);
            const teacher = teachers[app.teacher_id];
            const gameCategory = teacher?.game_category || '';

            return (
              <Card key={app.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {teacher?.nickname || `선생님 #${app.teacher_id}`}
                      </h3>
                      <p className={`text-sm ${getClassColor(gameCategory)}`}>
                        {getClassName(gameCategory)}
                      </p>
                    </div>
                    <Badge className={`${statusInfo.className} border flex items-center gap-1`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                    {teacher?.position && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">포지션</span>
                        <span className="text-gray-200">{teacher.position}</span>
                      </div>
                    )}
                    {teacher?.tier && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">티어</span>
                        <span className="text-gray-200">{teacher.tier}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">신청일</span>
                      <span className="text-gray-200">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString('ko-KR') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">신청 닉네임</span>
                      <span className="text-gray-200">{app.nickname}</span>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-yellow-400/80">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        관리자 확인 대기 중입니다
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelTarget(app)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        신청 취소
                      </Button>
                    </div>
                  )}
                  {app.status === 'approved' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-400/80">
                      <CheckCircle className="w-3 h-3" />
                      승인 완료! 디스코드로 연락드릴 예정입니다
                    </div>
                  )}
                  {app.status === 'rejected' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-400/80">
                      <XCircle className="w-3 h-3" />
                      다른 선생님에게 다시 신청해보세요
                    </div>
                  )}
                  {app.status === 'cancelled' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400/80">
                      <Ban className="w-3 h-3" />
                      신청이 취소되었습니다
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">신청을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {cancelTarget && (
                <>
                  <span className="font-semibold text-white">
                    {teachers[cancelTarget.teacher_id]?.nickname || `선생님 #${cancelTarget.teacher_id}`}
                  </span>
                  에 대한 신청을 취소합니다.
                  <br />
                  취소 후에는 다시 신청할 수 있습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              돌아가기
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelApplication}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {cancelling ? '취소 중...' : '신청 취소'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}