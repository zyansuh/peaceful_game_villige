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

const defaultForm = {
  game_category: 'overwatch',
  class_name: '수달반',
  nickname: '',
  intro: '',
  detail_intro: '',
  tier: '',
  active_time: '',
  personality: '',
  teaching_style: '',
  position: '',
  message: '',
  max_students: 5,
  current_students: 0,
  status: 'recruiting',
};

const categoryToClass: Record<string, string> = {
  overwatch: '수달반',
  pubg: '사자반',
  valorant: '여우반',
};

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

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
      const data = {
        ...form,
        class_name: categoryToClass[form.game_category] || '수달반',
        max_students: Number(form.max_students),
        current_students: Number(form.current_students),
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
    setForm({
      game_category: teacher.game_category,
      class_name: teacher.class_name,
      nickname: teacher.nickname,
      intro: teacher.intro || '',
      detail_intro: teacher.detail_intro || '',
      tier: teacher.tier || '',
      active_time: teacher.active_time || '',
      personality: teacher.personality || '',
      teaching_style: teacher.teaching_style || '',
      position: teacher.position || '',
      message: teacher.message || '',
      max_students: teacher.max_students,
      current_students: teacher.current_students,
      status: teacher.status,
    });
    setEditingId(teacher.id);
    setShowForm(true);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
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
                  <Label className="text-gray-300">한줄 소개</Label>
                  <Input value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">상세 소개</Label>
                  <Textarea value={form.detail_intro} onChange={(e) => setForm({ ...form, detail_intro: e.target.value })} rows={3} className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">게임 티어</Label>
                    <Input value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-300">포지션</Label>
                    <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">활동 시간</Label>
                  <Input value={form.active_time} onChange={(e) => setForm({ ...form, active_time: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">교육 스타일</Label>
                  <Input value={form.teaching_style} onChange={(e) => setForm({ ...form, teaching_style: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
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
                <div>
                  <Label className="text-gray-300">한마디</Label>
                  <Input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-gray-800 border-gray-700 text-white mt-1" />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {editingId ? '수정 완료' : '등록 완료'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{teacher.nickname}</h3>
                    {getStatusBadge(teacher.status)}
                    <Badge variant="outline" className="border-gray-600 text-gray-400">{teacher.class_name}</Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {teacher.position} · {teacher.tier} · 인원: {teacher.current_students}/{teacher.max_students}
                  </div>
                </div>
                <div className="flex gap-2">
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}