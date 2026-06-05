import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';

interface Application {
  id: number;
  nickname: string;
  discord_id: string;
  age: number;
  game_experience: string;
  teacher_id: number;
  class_name: string;
  status: string;
  admin_memo: string;
  created_at: string;
}

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editForm, setEditForm] = useState({
    nickname: '',
    discord_id: '',
    age: 0,
    game_experience: '',
    class_name: '',
    status: '',
    admin_memo: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }

        const appsRes = await client.entities.applications.query({ query: {}, limit: 100, sort: '-created_at' });
        setApplications(appsRes?.data?.items || []);

        const teachersRes = await client.entities.teachers.query({ query: {}, limit: 50 });
        setTeachers(teachersRes?.data?.items || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.nickname || '알 수 없음';
  };

  const updateStatus = async (appId: number, newStatus: string) => {
    try {
      await client.entities.applications.update({
        id: String(appId),
        data: { status: newStatus },
      });
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const openEditDialog = (app: Application) => {
    setEditingApp(app);
    setEditForm({
      nickname: app.nickname || '',
      discord_id: app.discord_id || '',
      age: app.age || 0,
      game_experience: app.game_experience || '',
      class_name: app.class_name || '',
      status: app.status || 'pending',
      admin_memo: app.admin_memo || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingApp) return;
    setSaving(true);
    try {
      await client.entities.applications.update({
        id: String(editingApp.id),
        data: {
          nickname: editForm.nickname,
          discord_id: editForm.discord_id,
          age: editForm.age,
          game_experience: editForm.game_experience,
          class_name: editForm.class_name,
          status: editForm.status,
          admin_memo: editForm.admin_memo,
        },
      });
      setApplications(prev =>
        prev.map(app =>
          app.id === editingApp.id
            ? { ...app, ...editForm }
            : app
        )
      );
      setEditingApp(null);
    } catch (err) {
      console.error('Failed to update application:', err);
      alert('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (appId: number) => {
    try {
      await client.entities.applications.delete({ id: String(appId) });
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      console.error('Failed to delete application:', err);
      alert('삭제에 실패했습니다.');
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </AdminPasswordGate>
    );
  }

  return (
    <AdminPasswordGate>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">신청 관리</h1>
        <Link to="/admin">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            ← 대시보드
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">아직 신청 내역이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{app.nickname}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">반: </span>
                        <span className="text-gray-300">{app.class_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">선생님: </span>
                        <span className="text-gray-300">{getTeacherName(app.teacher_id)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">디스코드: </span>
                        <span className="text-gray-300">{app.discord_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">신청일: </span>
                        <span className="text-gray-300">{app.created_at ? new Date(app.created_at).toLocaleDateString('ko-KR') : '-'}</span>
                      </div>
                    </div>
                    {app.game_experience && (
                      <p className="text-gray-400 text-sm mt-2">경력: {app.game_experience}</p>
                    )}
                    {app.admin_memo && (
                      <p className="text-gray-500 text-sm mt-1">메모: {app.admin_memo}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value)}
                    >
                      <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="pending">승인대기</SelectItem>
                        <SelectItem value="approved">승인</SelectItem>
                        <SelectItem value="rejected">거절</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => openEditDialog(app)}
                    >
                      수정
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-700 text-red-400 hover:bg-red-900/30"
                        >
                          삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">신청 삭제</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            &quot;{app.nickname}&quot;의 신청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                            취소
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => handleDelete(app.id)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingApp} onOpenChange={(open) => { if (!open) setEditingApp(null); }}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">신청 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">닉네임</Label>
              <Input
                value={editForm.nickname}
                onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">디스코드 ID</Label>
              <Input
                value={editForm.discord_id}
                onChange={(e) => setEditForm(prev => ({ ...prev, discord_id: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">나이</Label>
              <Input
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">게임 경력</Label>
              <Textarea
                value={editForm.game_experience}
                onChange={(e) => setEditForm(prev => ({ ...prev, game_experience: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">반</Label>
              <Select
                value={editForm.class_name}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, class_name: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="수달반">수달반</SelectItem>
                  <SelectItem value="사자반">사자반</SelectItem>
                  <SelectItem value="여우반">여우반</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">상태</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="pending">승인대기</SelectItem>
                  <SelectItem value="approved">승인</SelectItem>
                  <SelectItem value="rejected">거절</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">관리자 메모</Label>
              <Textarea
                value={editForm.admin_memo}
                onChange={(e) => setEditForm(prev => ({ ...prev, admin_memo: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setEditingApp(null)}
              >
                취소
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleEditSave}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminPasswordGate>
  );
}