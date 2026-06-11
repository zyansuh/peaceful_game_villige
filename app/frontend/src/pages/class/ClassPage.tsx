import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import client from '@/lib/client';
import { CLASS_INFO } from '@/constants/class-info';
import type { Teacher } from '@/types/teacher';
import { parseDetailIntro } from '@/utils/teacher/parse-detail-intro';

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const info = CLASS_INFO[classId || ''] || CLASS_INFO.overwatch;

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [classId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchTeachers();
    };
    const handleFocus = () => fetchTeachers();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchTeachers]);

  const sortedTeachers = useMemo(() => {
    return [...teachers].sort((a, b) => {
      const aIsClosed = a.status === 'closed' || a.current_students >= a.max_students;
      const bIsClosed = b.status === 'closed' || b.current_students >= b.max_students;
      if (aIsClosed !== bIsClosed) return aIsClosed ? 1 : -1;
      return (b.max_students - b.current_students) - (a.max_students - a.current_students);
    });
  }, [teachers]);

  const availableCount = teachers
    .filter((t) => t.status === 'recruiting')
    .reduce((sum, t) => sum + (t.max_students - t.current_students), 0);

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
        title={`${info.name} · ${info.gameKr}`}
        subtitle="담당 선생님을 선택하세요"
        backTo="/"
        backLabel="홈으로"
        action={
          <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs whitespace-nowrap">
            <Users className="h-3 w-3 mr-1 inline" />
            잔여 {availableCount}명
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {sortedTeachers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-sm">선생님이 없습니다</p>
          </div>
        )}
        {sortedTeachers.map((teacher) => {
          const isFull =
            teacher.current_students >= teacher.max_students ||
            teacher.status === '선택불가' ||
            teacher.status === 'closed';
          const fillPercent = Math.min((teacher.current_students / teacher.max_students) * 100, 100);

          return (
            <Card
              key={teacher.id}
              className={`bg-gray-900 border-gray-800 transition-all duration-300 sm:hover:-translate-y-0.5 sm:hover:shadow-lg ${isFull ? 'opacity-70' : ''}`}
            >
              <CardContent className="card-pad">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-800 flex items-center justify-center text-xl shrink-0">
                    👨‍🏫
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      {teacher.nickname} {teacher.position}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1 text-xs sm:text-sm mb-3 sm:mb-4">
                  {(() => {
                    const { gender, birthYear } = parseDetailIntro(teacher.detail_intro);
                    return (
                      <>
                        <p className="text-gray-300 truncate"><span className="text-gray-500">성별</span> {gender || '-'}</p>
                        <p className="text-gray-300 truncate"><span className="text-gray-500">출생</span> {birthYear || '-'}</p>
                      </>
                    );
                  })()}
                  <p className="text-gray-300 truncate"><span className="text-gray-500">MBTI</span> {teacher.personality || '-'}</p>
                  <p className="text-gray-300 line-clamp-2"><span className="text-gray-500">소개</span> {teacher.intro || '-'}</p>
                </div>

                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">인원</span>
                    <span className="text-xs font-medium">
                      <span className={isFull ? 'text-red-400' : 'text-green-400'}>{teacher.current_students}</span>
                      <span className="text-gray-500">/{teacher.max_students}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  {(teacher.status === 'recruiting' || teacher.status === 'available') && !isFull && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">모집중</Badge>
                  )}
                  {(teacher.status === 'closed' || teacher.status === '선택불가' || isFull) && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">마감</Badge>
                  )}
                  {teacher.status === 'resting' && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">휴식중</Badge>
                  )}
                </div>

                <div className="flex flex-col xs:flex-row gap-2">
                  <Link to={`/teacher/${teacher.id}`} className="flex-1 min-w-0">
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm">
                      상세보기
                    </Button>
                  </Link>
                  {isFull ? (
                    <Button disabled className="flex-1 bg-gray-700 text-gray-500 text-xs sm:text-sm">
                      선택불가
                    </Button>
                  ) : (
                    <Link to={`/apply/${teacher.id}`} className="flex-1 min-w-0">
                      <Button className={`w-full bg-gradient-to-r ${info.gradient} text-white border-0 text-xs sm:text-sm`}>
                        선택하기
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
