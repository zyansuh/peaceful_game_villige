import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
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
      const username = user.username || user.email || '';
      await client.entities.applications.create({
        data: {
          nickname: username,
          discord_id: '',
          age: 0,
          game_experience: '',
          teacher_id: teacher.id,
          class_name: teacher.class_name,
          status: 'approved',
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

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">신청자</p>
            <p className="text-white text-lg font-semibold">{user?.username || user?.email || '로그인 사용자'}</p>
          </div>

          <p className="text-center text-gray-300 mb-6 text-base">
            아래 선생님에게 신청하시겠습니까?
          </p>

          <form onSubmit={handleSubmit}>
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