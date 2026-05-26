import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
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
  teaching_style: string;
  personality: string;
  active_time: string;
}

const classInfo: Record<string, { name: string; gameKr: string; color: string; gradient: string }> = {
  overwatch: { name: '수달반', gameKr: '오버워치', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-400' },
  pubg: { name: '사자반', gameKr: '배틀그라운드', color: 'text-orange-400', gradient: 'from-orange-500 to-amber-400' },
  valorant: { name: '여우반', gameKr: '발로란트', color: 'text-purple-400', gradient: 'from-purple-500 to-pink-400' },
};

type SortOption = 'remaining' | 'name';

export default function ClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort state
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('remaining');

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

  // Extract unique positions and tiers for filter options
  const positions = useMemo(() => {
    const set = new Set(teachers.map(t => t.position).filter(Boolean));
    return Array.from(set);
  }, [teachers]);

  const tiers = useMemo(() => {
    const set = new Set(teachers.map(t => t.tier).filter(Boolean));
    return Array.from(set);
  }, [teachers]);

  // Filtered and sorted teachers
  const filteredTeachers = useMemo(() => {
    let result = [...teachers];

    if (positionFilter) {
      result = result.filter(t => t.position === positionFilter);
    }
    if (tierFilter) {
      result = result.filter(t => t.tier === tierFilter);
    }

    if (sortBy === 'remaining') {
      result.sort((a, b) => {
        const remainA = a.max_students - a.current_students;
        const remainB = b.max_students - b.current_students;
        return remainA - remainB; // fewer remaining first (urgency)
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'));
    }

    return result;
  }, [teachers, positionFilter, tierFilter, sortBy]);

  const availableCount = teachers.filter(t => t.status === 'recruiting').reduce((sum, t) => sum + (t.max_students - t.current_students), 0);

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (positionFilter) {
    activeFilters.push({ label: `포지션: ${positionFilter}`, onRemove: () => setPositionFilter(null) });
  }
  if (tierFilter) {
    activeFilters.push({ label: `티어: ${tierFilter}`, onRemove: () => setTierFilter(null) });
  }

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
      <div className="mb-6">
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

      {/* Filters & Sort */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Select value={positionFilter || ''} onValueChange={(v) => setPositionFilter(v || null)}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-gray-300">
              <SelectValue placeholder="포지션 필터" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tierFilter || ''} onValueChange={(v) => setTierFilter(v || null)}>
            <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-gray-300">
              <SelectValue placeholder="티어 필터" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {tiers.map((tier) => (
                <SelectItem key={tier} value={tier}>{tier}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44 bg-gray-900 border-gray-700 text-gray-300">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="remaining">남은 자리순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={filter.onRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-sm text-gray-200 hover:bg-gray-700 hover:border-gray-500 transition-colors"
              >
                {filter.label}
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ))}
            <button
              onClick={() => { setPositionFilter(null); setTierFilter(null); }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              전체 해제
            </button>
          </div>
        )}
      </div>

      {/* Teacher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">조건에 맞는 선생님이 없습니다.</p>
          </div>
        )}
        {filteredTeachers.map((teacher) => {
          const isFull = teacher.current_students >= teacher.max_students || teacher.status === '선택불가' || teacher.status === 'closed';
          const remaining = teacher.max_students - teacher.current_students;
          const isAlmostFull = !isFull && (teacher.status === '마감임박' || (remaining <= 2 && remaining > 0 && (teacher.status === 'recruiting' || teacher.status === 'available')));
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
                        <h3 className="text-lg font-bold text-white truncate">{teacher.nickname} {teacher.position}</h3>
                        {isAlmostFull && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white animate-[blink_1s_ease-in-out_infinite] shrink-0">
                            🔥 마감 임박!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="space-y-1 text-sm mb-4">
                    <p className="text-gray-300"><span className="text-gray-500">성별 :</span> {teacher.teaching_style || '-'}</p>
                    <p className="text-gray-300"><span className="text-gray-500">출생년도 :</span> {teacher.tier || '-'}</p>
                    <p className="text-gray-300"><span className="text-gray-500">MBTI :</span> {teacher.personality || '-'}</p>
                    <p className="text-gray-300"><span className="text-gray-500">게임유형 :</span> {teacher.active_time || '-'}</p>
                    <p className="text-gray-300 line-clamp-2"><span className="text-gray-500">소개 :</span> {teacher.intro || '-'}</p>
                  </div>

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
                      {(teacher.status === 'recruiting' || teacher.status === 'available') && !isFull && !isAlmostFull && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">모집중</Badge>
                      )}
                      {isAlmostFull && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">마감 임박</Badge>
                      )}
                      {(teacher.status === 'closed' || teacher.status === '선택불가' || (isFull && !isAlmostFull)) && (
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