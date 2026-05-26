import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';

interface Teacher {
  id: number;
  game_category: string;
  class_name: string;
  nickname: string;
  intro: string;
  detail_intro: string;
  tier: string;
  active_time: string;
  personality: string;
  teaching_style: string;
  position: string;
  message: string;
  max_students: number;
  current_students: number;
  status: string;
}

interface TeacherForm {
  game_category: string;
  class_name: string;
  nickname: string;
  position: string;
  gender: string;
  birth_year: string;
  mbti: string;
  game_type: string;
  intro: string;
  max_students: number;
  current_students: number;
  status: string;
}

const defaultForm: TeacherForm = {
  game_category: 'overwatch',
  class_name: '수달반',
  nickname: '',
  position: '선생님',
  gender: '',
  birth_year: '',
  mbti: '',
  game_type: '',
  intro: '',
  max_students: 5,
  current_students: 0,
  status: 'recruiting',
};

const categoryToClass: Record<string, string> = {
  overwatch: '수달반',
  pubg: '사자반',
  valorant: '여우반',
};

type ClassFilter = '전체' | '수달반' | '사자반' | '여우반';

function parseDetailIntro(detailIntro: string): { gender: string; birthYear: string } {
  let gender = '';
  let birthYear = '';
  if (detailIntro) {
    const genderMatch = detailIntro.match(/성별:\s*([^\s|]+)/);
    const birthMatch = detailIntro.match(/출생년도:\s*([^\s|]+)/);
    if (genderMatch) gender = genderMatch[1];
    if (birthMatch) birthYear = birthMatch[1].replace('년생', '');
  }
  return { gender, birthYear };
}

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TeacherForm>(defaultForm);
  const [classFilter, setClassFilter] = useState<ClassFilter>('전체');

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
          return;
        }
        await fetchTeachers();
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
    const res = await client.entities.teachers.query({ query: {}, limit: 50 });
    setTeachers(res?.data?.items || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const detailIntro = `성별: ${form.gender} | 출생년도: ${form.birth_year}년생`;
      const data = {
        game_category: form.game_category,
        class_name: categoryToClass[form.game_category] || '수달반',
        nickname: form.nickname,
        position: form.position,
        detail_intro: detailIntro,
        personality: form.mbti,
        teaching_style: form.game_type,
        intro: form.intro,
        message: form.intro,
        max_students: Number(form.max_students),
        current_students: Number(form.current_students),
        status: form.status,
        tier: '',
        active_time: '',
      };

      if (editingId) {
        await client.entities.teachers.update({ id: String(editingId), data });
      } else {
        await client.entities.teachers.create({ data });
      }
      await fetchTeachers();
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
    } catch (err) {
      console.error('Failed to save teacher:', err);
      alert('저장에 실패했습니다.');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    const { gender, birthYear } = parseDetailIntro(teacher.detail_intro);
    setForm({
      game_category: teacher.game_category,
      class_name: teacher.class_name,
      nickname: teacher.nickname,
      position: teacher.position || '선생님',
      gender,
      birth_year: birthYear,
      mbti: teacher.personality || '',
      game_type: teacher.teaching_style || '',
      intro: teacher.intro || '',
      max_students: teacher.max_students,
      current_students: teacher.current_students,
      status: teacher.status,
    });
    setEditingId(teacher.id);
    setShowForm(true);
  };

  const handleDelete = async (teacherId: number) => {
    try {
      await client.entities.teachers.delete({ id: String(teacherId) });
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
    } catch (err) {
      console.error('Failed to delete teacher:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const updateStatus = async (teacherId: number, newStatus: string) => {
    try {
      await client.entities.teachers.update({
        id: String(teacherId),
        data: { status: newStatus },
      });
      setTeachers(prev =>
        prev.map(t => t.id === teacherId ? { ...t, status: newStatus } : t)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
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

  const filteredTeachers = classFilter === '전체'
    ? teachers
    : teachers.filter(t => t.class_name === classFilter);

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
        <h1 className="text-2xl font-bold text-white">선생님 관리</h1>
        <div className="flex gap-2">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              ← 대시보드
            </Button>
          </Link>
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingId(null); setForm(defaultForm); } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                + 선생님 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? '선생님 수정' : '선생님 등록'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-300">게임 카테고리</Label>
                  <Select value={form.game_category} onValueChange={(v) => setForm({ ...form, game_category: v, class_name: categoryToClass[v] })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="overwatch">오버워치 (수달반)</SelectItem>
                      <SelectItem value="pubg">배틀그라운드 (사자반)</SelectItem>
                      <SelectItem value="valorant">발로란트 (여우반)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">닉네임</Label>
                  <Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">직책</Label>
                  <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="선생님">선생님</SelectItem>
                      <SelectItem value="주임교사">주임교사</SelectItem>
                      <SelectItem value="국장">국장</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">성별</Label>
                    <Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="남 / 여" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-300">출생년도</Label>
                    <Input value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} placeholder="예: 99" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">MBTI</Label>
                    <Input value={form.mbti} onChange={(e) => setForm({ ...form, mbti: e.target.value })} placeholder="예: ENFP" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-300">게임유형</Label>
                    <Input value={form.game_type} onChange={(e) => setForm({ ...form, game_type: e.target.value })} placeholder="예: 빠대/경쟁" className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">소개</Label>
                  <Textarea value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} rows={3} placeholder="선생님 소개를 입력하세요" className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">최대 인원</Label>
                    <Input type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: parseInt(e.target.value) || 0 })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-300">현재 인원</Label>
                    <Input type="number" value={form.current_students} onChange={(e) => setForm({ ...form, current_students: parseInt(e.target.value) || 0 })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">상태</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="recruiting">모집중</SelectItem>
                      <SelectItem value="closed">마감</SelectItem>
                      <SelectItem value="resting">휴식중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {editingId ? '수정 완료' : '등록 완료'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Class Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['전체', '수달반', '사자반', '여우반'] as ClassFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={classFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setClassFilter(filter)}
            className={
              classFilter === filter
                ? filter === '수달반' ? 'bg-blue-500 text-white border-0 hover:bg-blue-600'
                  : filter === '사자반' ? 'bg-orange-500 text-white border-0 hover:bg-orange-600'
                  : filter === '여우반' ? 'bg-purple-500 text-white border-0 hover:bg-purple-600'
                  : 'bg-gray-600 text-white border-0 hover:bg-gray-700'
                : 'border-gray-700 text-gray-300 hover:bg-gray-800'
            }
          >
            {filter}
          </Button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">
          {filteredTeachers.length}명
        </span>
      </div>

      <div className="space-y-4">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{teacher.nickname}</h3>
                    {getStatusBadge(teacher.status)}
                    <Badge variant="outline" className="border-gray-600 text-gray-400">{teacher.class_name}</Badge>
                    {teacher.position && (
                      <Badge variant="outline" className="border-gray-600 text-gray-500">{teacher.position}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {teacher.detail_intro} · MBTI: {teacher.personality || '-'} · 게임유형: {teacher.teaching_style || '-'} · 인원: {teacher.current_students}/{teacher.max_students}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={teacher.status} onValueChange={(v) => updateStatus(teacher.id, v)}>
                    <SelectTrigger className="w-28 bg-gray-800 border-gray-700 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="recruiting">모집중</SelectItem>
                      <SelectItem value="closed">마감</SelectItem>
                      <SelectItem value="resting">휴식중</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    수정
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-700 text-red-400 hover:bg-red-900/30">
                        삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">선생님 삭제</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          &apos;{teacher.nickname}&apos; 선생님을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(teacher.id)} className="bg-red-600 text-white hover:bg-red-700">삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 선생님이 없습니다.
          </div>
        )}
      </div>
    </div>
    </AdminPasswordGate>
  );
}