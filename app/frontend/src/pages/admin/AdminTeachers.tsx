import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
import AdminPasswordGate from '@/components/admin/AdminPasswordGate';
import TeacherFormModal from '@/components/admin/TeacherFormModal';
import client from '@/lib/client';
import {
  deleteTeacher,
  updateTeacherStatus,
} from '@/lib/api/teachers-admin';
import type { AdminTeacher } from '@/utils/teacher/teacher-form';

interface AssignedApplication {
  id: number;
  nickname: string;
  teacher_id: number;
  status: string;
  created_at: string;
}

type ClassFilter = '전체' | '수달반' | '사자반' | '여우반';

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);
  const [classFilter, setClassFilter] = useState<ClassFilter>('전체');
  const [adminEmail, setAdminEmail] = useState<string>('admin');
  const [applications, setApplications] = useState<AssignedApplication[]>([]);
  const [expandedRosterId, setExpandedRosterId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }
        setAdminEmail(userRes.data.email || 'admin');
        await Promise.all([fetchTeachers(), fetchApplications()]);
      } catch (err) {
        console.error('Failed to load:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const fetchTeachers = async () => {
    const res = await client.entities.teachers.query({ query: {}, limit: 100, sort: '-id' });
    setTeachers(res?.data?.items || []);
  };

  const fetchApplications = async () => {
    try {
      const res = await client.entities.applications.queryAll({
        query: {},
        limit: 2000,
        sort: '-created_at',
      });
      const items = res?.data?.items || res?.data || [];
      setApplications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    }
  };

  const studentsByTeacher = useMemo(() => {
    const map = new Map<number, AssignedApplication[]>();
    applications
      .filter((app) => app.status === 'approved')
      .forEach((app) => {
        const list = map.get(app.teacher_id) || [];
        list.push(app);
        map.set(app.teacher_id, list);
      });
    return map;
  }, [applications]);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setModalOpen(true);
  };

  const openEditModal = (teacher: AdminTeacher) => {
    setEditingTeacher(teacher);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingTeacher(null);
  };

  const handleSaved = (teacher: AdminTeacher, mode: 'create' | 'update') => {
    if (mode === 'create') {
      setTeachers((prev) => [teacher, ...prev]);
    } else {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? teacher : t))
      );
    }
  };

  const handleDelete = async (teacher: AdminTeacher) => {
    try {
      await deleteTeacher(teacher, adminEmail);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
    } catch (err) {
      console.error('Failed to delete teacher:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const updateStatus = async (teacherId: number, newStatus: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    try {
      await updateTeacherStatus(teacherId, newStatus, teacher, adminEmail);
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recruiting':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">모집중</Badge>;
      case 'closed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">마감</Badge>;
      case 'resting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">휴식중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTeachers =
    classFilter === '전체'
      ? teachers
      : teachers.filter((t) => t.class_name === classFilter);

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="page-container text-center">
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </AdminPasswordGate>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="page-container">
        <PageHeader
          title="선생님 관리"
          subtitle={`${filteredTeachers.length}명 · 모달에서 바로 DB 저장`}
          backTo="/admin"
          backLabel="대시보드"
          action={
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 w-full sm:w-auto"
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-1" />
              선생님 등록
            </Button>
          }
        />

        <TeacherFormModal
          open={modalOpen}
          onOpenChange={handleModalOpenChange}
          editingTeacher={editingTeacher}
          adminEmail={adminEmail}
          onSaved={handleSaved}
        />

        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {(['전체', '수달반', '사자반', '여우반'] as ClassFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={classFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setClassFilter(filter)}
              className={
                classFilter === filter
                  ? filter === '수달반'
                    ? 'bg-blue-500 text-white border-0 hover:bg-blue-600'
                    : filter === '사자반'
                      ? 'bg-orange-500 text-white border-0 hover:bg-orange-600'
                      : filter === '여우반'
                        ? 'bg-purple-500 text-white border-0 hover:bg-purple-600'
                        : 'bg-gray-600 text-white border-0 hover:bg-gray-700'
                  : 'border-gray-700 text-gray-300 hover:bg-gray-800'
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTeachers.map((teacher) => {
            const assignedStudents = studentsByTeacher.get(teacher.id) || [];
            const rosterOpen = expandedRosterId === teacher.id;

            return (
              <Card key={teacher.id} className="bg-gray-900 border-gray-800">
                <CardContent className="card-pad">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                          {teacher.nickname}
                        </h3>
                        {getStatusBadge(teacher.status)}
                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                          {teacher.class_name}
                        </Badge>
                        {teacher.position && (
                          <Badge variant="outline" className="border-gray-600 text-gray-500 text-xs">
                            {teacher.position}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">
                        {teacher.detail_intro} · MBTI: {teacher.personality || '-'} · 인원:{' '}
                        {teacher.current_students}/{teacher.max_students}
                      </p>
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-cyan-700/50 text-cyan-300 hover:bg-cyan-950/40 text-xs"
                          onClick={() =>
                            setExpandedRosterId(rosterOpen ? null : teacher.id)
                          }
                        >
                          담당 유저 ({assignedStudents.length}명) ▼
                        </Button>
                        {rosterOpen && (
                          <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950/60 p-3">
                            {assignedStudents.length === 0 ? (
                              <p className="text-sm text-gray-500">배정된 유저 없음</p>
                            ) : (
                              <ul className="space-y-2">
                                {assignedStudents.map((student, index) => (
                                  <li
                                    key={student.id}
                                    className="flex items-center justify-between gap-3 rounded-md bg-gray-900/80 px-3 py-2 text-sm"
                                  >
                                    <span className="text-white font-medium truncate">
                                      {index + 1}. {student.nickname || '닉네임 없음'}
                                    </span>
                                    <span className="text-gray-500 text-xs shrink-0">
                                      {student.created_at
                                        ? new Date(student.created_at).toLocaleDateString('ko-KR')
                                        : '-'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select
                        value={teacher.status}
                        onValueChange={(v) => updateStatus(teacher.id, v)}
                      >
                        <SelectTrigger className="w-28 bg-gray-800 border-gray-700 text-gray-300 h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="recruiting">모집중</SelectItem>
                          <SelectItem value="closed">마감</SelectItem>
                          <SelectItem value="resting">휴식중</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(teacher)}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs"
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
                            <AlertDialogTitle className="text-white">선생님 삭제</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              「{teacher.nickname}」 선생님을 삭제하시겠습니까?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDelete(teacher)}
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
            );
          })}

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              등록된 선생님이 없습니다. 상단 「선생님 등록」을 눌러 추가하세요.
            </div>
          )}
        </div>
      </div>
    </AdminPasswordGate>
  );
}
