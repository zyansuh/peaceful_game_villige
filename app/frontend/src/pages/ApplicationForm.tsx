import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import client from '@/lib/client';

interface Teacher {
  id: number;
  nickname: string;
  class_name: string;
  game_category: string;
  max_students: number;
  current_students: number;
  status: string;
  position: string;
  tier: string;
}

export default function ApplicationForm() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    nickname: '',
    discord_id: '',
    age: '',
    game_experience: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
          return;
        }
        setUser(userRes.data);

        const res = await client.entities.teachers.get({ id: teacherId || '' });
        if (res?.data) {
          setTeacher(res.data);
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !user) return;

    setSubmitting(true);
    try {
      await client.entities.applications.create({
        data: {
          nickname: form.nickname,
          discord_id: form.discord_id,
          age: parseInt(form.age) || 0,
          game_experience: form.game_experience,
          teacher_id: teacher.id,
          class_name: teacher.class_name,
          status: 'pending',
        },
      });
      navigate(`/apply-complete?teacher=${encodeURIComponent(teacher.nickname)}&class=${encodeURIComponent(teacher.game_category || '')}&position=${encodeURIComponent(teacher.position || '')}&tier=${encodeURIComponent(teacher.tier || '')}`);
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">선생님 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to={`/class/${teacher.game_category}`} className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
        ← 돌아가기
      </Link>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold text-white mb-2">담당 선생님 신청</h1>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm">선택한 선생님</p>
            <p className="text-white text-lg font-semibold">{teacher.nickname}</p>
            <p className="text-gray-400 text-sm">{teacher.class_name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="nickname" className="text-gray-300">닉네임</Label>
              <Input
                id="nickname"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder="게임 내 닉네임을 입력해주세요"
                required
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discord_id" className="text-gray-300">디스코드 아이디</Label>
              <Input
                id="discord_id"
                value={form.discord_id}
                onChange={(e) => setForm({ ...form, discord_id: e.target.value })}
                placeholder="예: username#1234"
                required
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-gray-300">나이</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="나이를 입력해주세요"
                required
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>

            <div>
              <Label htmlFor="game_experience" className="text-gray-300">게임 경력</Label>
              <Textarea
                id="game_experience"
                value={form.game_experience}
                onChange={(e) => setForm({ ...form, game_experience: e.target.value })}
                placeholder="게임 경력이나 경험을 간단히 적어주세요"
                rows={3}
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 py-6 text-lg"
            >
              {submitting ? '신청 중...' : '신청 완료'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}