import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  profile_image: string;
  max_students: number;
  current_students: number;
  status: string;
}

export default function TeacherDetail() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await client.entities.teachers.get({ id: teacherId || '' });
        if (res?.data) {
          setTeacher(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch teacher:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [teacherId]);

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

  const isFull = teacher.current_students >= teacher.max_students || teacher.status !== 'recruiting';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
        ← 뒤로가기
      </button>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl shrink-0">
              👨‍🏫
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{teacher.nickname}</h1>
              <p className="text-gray-400">{teacher.class_name} · {teacher.game_category === 'overwatch' ? '오버워치' : teacher.game_category === 'pubg' ? '배틀그라운드' : '발로란트'}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="border-gray-600 text-gray-300">{teacher.tier}</Badge>
                <Badge variant="outline" className="border-gray-600 text-gray-300">{teacher.position}</Badge>
                {teacher.status === 'recruiting' && !isFull && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">모집중</Badge>
                )}
                {isFull && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">마감</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">활동 시간</p>
              <p className="text-gray-200">{teacher.active_time || '미정'}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">성격</p>
              <p className="text-gray-200">{teacher.personality || '미정'}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">교육 스타일</p>
              <p className="text-gray-200">{teacher.teaching_style || '미정'}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">현재 인원</p>
              <p className="text-gray-200">{teacher.current_students} / {teacher.max_students}</p>
            </div>
          </div>

          {/* Detail Intro */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">소개</h3>
            <p className="text-gray-300 leading-relaxed">{teacher.detail_intro}</p>
          </div>

          {/* Message */}
          {teacher.message && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
              <p className="text-gray-200 italic">"{teacher.message}"</p>
            </div>
          )}

          {/* Action Button */}
          {isFull ? (
            <Button disabled className="w-full bg-gray-700 text-gray-500 cursor-not-allowed py-6 text-lg">
              정원 마감 - 선택 불가
            </Button>
          ) : (
            <Link to={`/apply/${teacher.id}`}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 py-6 text-lg">
                이 선생님 선택하기
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}