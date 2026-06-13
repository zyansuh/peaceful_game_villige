import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import PageHeader from '@/components/common/PageHeader';
import ApplicationFormModal from '@/components/admin/ApplicationFormModal';
import { useToast } from '@/hooks/use-toast';
import client from '@/lib/client';
import {
  type AdminApplication,
  deleteApplication,
  fetchAllApplications,
  updateApplicationStatus,
} from '@/lib/api/applications-admin';

export default function AdminApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<{ id: number; nickname: string }[]>([]);
  const [editingApp, setEditingApp] = useState<AdminApplication | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin');

  const loadData = useCallback(async () => {
    setLoadError(null);
    const apps = await fetchAllApplications();
    setApplications(apps);

    const teachersRes = await client.entities.teachers.query({ query: {}, limit: 100 });
    setTeachers(teachersRes?.data?.items || []);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }
        setAdminEmail(userRes.data.email || 'admin');
        await loadData();
      } catch (err) {
        console.error('Failed to load applications:', err);
        setLoadError('신청 목록을 불러오지 못했습니다. 백엔드가 실행 중인지 확인해주세요.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadData, navigate]);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.nickname || '알 수 없음';
  };

  const openEditModal = (app: AdminApplication) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingApp(null);
  };

  const handleSaved = (app: AdminApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === app.id ? app : a)));
    toast({
      title: '저장 완료',
      description: `「${app.nickname}」 신청 정보가 반영되었습니다.`,
    });
  };

  const handleStatusChange = async (app: AdminApplication, newStatus: string) => {
    try {
      await updateApplicationStatus(
        app.id,
        newStatus,
        { nickname: app.nickname, class_name: app.class_name },
        adminEmail
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
      toast({
        title: '상태 변경',
        description: `「${app.nickname}」 → ${newStatus}`,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        variant: 'destructive',
        title: '상태 변경 실패',
        description: '다시 시도해주세요.',
      });
    }
  };

  const handleDelete = async (app: AdminApplication) => {
    try {
      await deleteApplication(app, adminEmail);
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      toast({
        title: '삭제 완료',
        description: `「${app.nickname}」 신청이 삭제되었습니다.`,
      });
    } catch (err) {
      console.error('Failed to delete application:', err);
      toast({
        variant: 'destructive',
        title: '삭제 실패',
        description: '다시 시도해주세요.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">승인대기</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">승인</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">거절</Badge>;
      case 'graduated':
        return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">졸업</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">취소</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="page-container text-center">
        <p className="text-gray-400 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
        <PageHeader
          title="신청 관리"
          subtitle={`${applications.length}건 · 전체 신청 조회`}
          backTo="/admin"
          backLabel="대시보드"
        />

        {loadError && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
            {loadError}
          </p>
        )}

        <ApplicationFormModal
          open={modalOpen}
          onOpenChange={handleModalOpenChange}
          application={editingApp}
          adminEmail={adminEmail}
          onSaved={handleSaved}
        />

        {applications.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="card-pad text-center">
              <p className="text-gray-400 text-sm">아직 신청 내역이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="bg-gray-900 border-gray-800">
                <CardContent className="card-pad">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                          {app.nickname}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500">반: </span>
                          <span className="text-gray-300">{app.class_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">선생님: </span>
                          <span className="text-gray-300">{getTeacherName(app.teacher_id)}</span>
                        </div>
                        <div className="truncate">
                          <span className="text-gray-500">디스코드: </span>
                          <span className="text-gray-300">{app.discord_id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">신청일: </span>
                          <span className="text-gray-300">
                            {app.created_at
                              ? new Date(app.created_at).toLocaleDateString('ko-KR')
                              : '-'}
                          </span>
                        </div>
                      </div>
                      {app.game_experience && (
                        <p className="text-gray-400 text-xs sm:text-sm mt-2 line-clamp-2">
                          경력: {app.game_experience}
                        </p>
                      )}
                      {app.admin_memo && (
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
                          메모: {app.admin_memo}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Select
                        value={app.status}
                        onValueChange={(value) => handleStatusChange(app, value)}
                      >
                        <SelectTrigger className="w-full sm:w-32 bg-gray-800 border-gray-700 text-gray-300 h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="pending">승인대기</SelectItem>
                          <SelectItem value="approved">승인</SelectItem>
                          <SelectItem value="rejected">거절</SelectItem>
                          <SelectItem value="graduated">졸업</SelectItem>
                          <SelectItem value="cancelled">취소</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs"
                        onClick={() => openEditModal(app)}
                      >
                        수정
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-700 text-red-400 hover:bg-red-900/30 text-xs"
                          >
                            삭제
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">신청 삭제</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              「{app.nickname}」의 신청을 삭제하시겠습니까?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDelete(app)}
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
