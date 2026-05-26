import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import client from '@/lib/client';

interface Teacher {
  id: number;
  nickname: string;
  intro: string;
  profile_image: string;
  max_students: number;
  current_students: number;
  status: string;
  position: string;
  tier: string;
}

const classInfo: Record<string, { name: string; gameKr: string; color: string; gradient: string }> = {
  overwatch: { name: '수달반', gameKr: '오버워치', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-400' },
  pubg: { name: '사자반', gameKr: '배틀그라운드', color: 'text-orange-400', gradient: 'from-orange-500 to-amber-400' },
  valorant: { name: '여우반', gameKr: '발로란트', color: 'text-purple-400', gradient: 'from-purple-500 to-pink-400' },
};

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const info = classInfo[classId || ''] || classInfo.overwatch;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await client.entities.teachers.query({
          query: { game_category: classId },
          limit: 20,
        });
        if (res?.data?.items) {
          setTeachers(res.data.items);
        }
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [classId]);

  const availableCount = teachers.filter(t => t.status === 'recruiting').reduce((sum, t) => sum + (t.max_students - t.current_students), 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">
          ← 메인으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold">
          <span className={info.color}>{info.name}</span>
          <span className="text-gray-400 text-lg ml-2">| {info.gameKr}</span>
        </h1>
        <p className="text-gray-400 mt-2">신입 담당 선생님을 선택해주세요</p>
        <div className="mt-3">
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            현재 신청 가능 인원: {availableCount}명
          </Badge>
        </div>
      </div>

      {/* Teacher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => {
          const isFull = teacher.current_students >= teacher.max_students || teacher.status !== 'recruiting';
          const remaining = teacher.max_students - teacher.current_students;
          const isAlmostFull = !isFull && remaining <= 2 && teacher.status === 'recruiting';
          const fillPercent = Math.min((teacher.current_students / teacher.max_students) * 100, 100);

          return (
            <Card key={teacher.id} className={`bg-gray-900 border-gray-800 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isFull ? 'opacity-70' : ''} ${isAlmostFull ? 'border-red-500/50 shadow-red-500/10 shadow-lg' : ''}`}>
              <CardContent className="p-6 relative overflow-hidden">
                {/* Almost full pulse background effect */}
                {isAlmostFull && (
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                )}

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl shrink-0 ${isAlmostFull ? 'ring-2 ring-red-500/50 animate-pulse' : ''}`}>
                      👨‍🏫
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">{teacher.nickname}</h3>
                        {isAlmostFull && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white animate-[blink_1s_ease-in-out_infinite] shrink-0">
                            🔥 마감 임박!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{teacher.position} · {teacher.tier}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{teacher.intro}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">인원 현황</span>
                      <span className="text-xs font-medium">
                        <span className={isFull ? 'text-red-400' : isAlmostFull ? 'text-orange-400' : 'text-green-400'}>
                          {teacher.current_students}
                        </span>
                        <span className="text-gray-500"> / {teacher.max_students}명</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-red-500'
                            : isAlmostFull
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse'
                            : 'bg-gradient-to-r from-green-500 to-emerald-400'
                        }`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    {isAlmostFull && (
                      <p className="text-xs text-red-400 mt-1 animate-pulse font-medium">
                        ⚡ 남은 자리 {remaining}명! 서두르세요!
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {teacher.status === 'recruiting' && !isFull && !isAlmostFull && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">모집중</Badge>
                      )}
                      {isAlmostFull && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">마감 임박</Badge>
                      )}
                      {(teacher.status === 'closed' || isFull) && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">마감</Badge>
                      )}
                      {teacher.status === 'resting' && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">휴식중</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/teacher/${teacher.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                        상세보기
                      </Button>
                    </Link>
                    {isFull ? (
                      <Button disabled className="flex-1 bg-gray-700 text-gray-500 cursor-not-allowed">
                        선택불가
                      </Button>
                    ) : (
                      <Link to={`/apply/${teacher.id}`} className="flex-1">
                        <Button className={`w-full bg-gradient-to-r ${info.gradient} text-white border-0 hover:opacity-90 ${isAlmostFull ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>
                          {isAlmostFull ? '🔥 지금 선택!' : '선택하기'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}