import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';

interface Interview {
  id: number;
  user_id: string;
  teacher_id: number;
  teacher_name: string;
  class_name: string;
  answer1: string;
  answer2: string;
  answer3: string;
  created_at: string;
}

function getClassColor(className: string): { bg: string; text: string; border: string; label: string } {
  if (className.includes('수달') || className.includes('overwatch')) {
    return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: '수달반' };
  }
  if (className.includes('사자') || className.includes('pubg')) {
    return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: '사자반' };
  }
  if (className.includes('여우') || className.includes('valorant')) {
    return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: '여우반' };
  }
  return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: className };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMonthKey(dateStr: string): string {
  if (!dateStr) return 'unknown';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  if (key === 'unknown') return '날짜 없음';
  const [year, month] = key.split('-');
  return `${year}년 ${parseInt(month)}월`;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '-';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export default function AdminInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
          return;
        }

        const res = await client.entities.graduation_interviews.query({ query: {}, limit: 500, sort: '-created_at' });
        setInterviews(res?.data?.items || []);
      } catch (err) {
        console.error('Failed to load interviews:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  // Computed statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const otterCount = interviews.filter(
      (i) => i.class_name.includes('수달') || i.class_name.includes('overwatch')
    ).length;
    const lionCount = interviews.filter(
      (i) => i.class_name.includes('사자') || i.class_name.includes('pubg')
    ).length;
    const foxCount = interviews.filter(
      (i) => i.class_name.includes('여우') || i.class_name.includes('valorant')
    ).length;

    const thisMonthCount = interviews.filter((i) => getMonthKey(i.created_at) === thisMonthKey).length;
    const last7DaysCount = interviews.filter((i) => {
      if (!i.created_at) return false;
      return new Date(i.created_at) >= sevenDaysAgo;
    }).length;

    // Teacher breakdown
    const teacherMap: Record<string, number> = {};
    interviews.forEach((i) => {
      const key = i.teacher_name || '알 수 없음';
      teacherMap[key] = (teacherMap[key] || 0) + 1;
    });
    const topTeachers = Object.entries(teacherMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total: interviews.length,
      thisMonth: thisMonthCount,
      last7Days: last7DaysCount,
      otterCount,
      lionCount,
      foxCount,
      topTeachers,
    };
  }, [interviews]);

  // Available months for filter
  const months = useMemo(() => {
    return [...new Set(interviews.map((i) => getMonthKey(i.created_at)))].sort().reverse();
  }, [interviews]);

  // Filtered interviews
  const filteredInterviews = useMemo(() => {
    let result = [...interviews];

    // Filter by class
    if (selectedClass !== 'all') {
      result = result.filter((i) => {
        if (selectedClass === 'otter') return i.class_name.includes('수달') || i.class_name.includes('overwatch');
        if (selectedClass === 'lion') return i.class_name.includes('사자') || i.class_name.includes('pubg');
        if (selectedClass === 'fox') return i.class_name.includes('여우') || i.class_name.includes('valorant');
        return true;
      });
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      result = result.filter((i) => getMonthKey(i.created_at) === selectedMonth);
    }

    // Search by teacher name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((i) => i.teacher_name?.toLowerCase().includes(q));
    }

    return result;
  }, [interviews, selectedClass, selectedMonth, searchQuery]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <AdminPasswordGate>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">면담 데이터를 불러오는 중...</p>
          </div>
        </div>
      </AdminPasswordGate>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">졸업면담 관리</h1>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-sm px-3 py-1">
              총 {stats.total}건
            </Badge>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              ← 대시보드
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">총 면담 수</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">이번 달</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.thisMonth}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Distribution */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">반별 분포</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  수달 {stats.otterCount}
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  사자 {stats.lionCount}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  여우 {stats.foxCount}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Last 7 Days */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">최근 7일</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.last7Days}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Teachers Mini-Section */}
        {stats.topTeachers.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">선생님별 면담 현황 (상위 5명)</p>
              <div className="flex flex-wrap gap-3">
                {stats.topTeachers.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 bg-gray-800/70 rounded-lg px-3 py-2 border border-gray-700/50"
                  >
                    <span className="text-white text-sm font-medium">{name}</span>
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                      {count}건
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Section */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-gray-400 text-sm font-medium whitespace-nowrap">필터:</span>

              {/* Class Filter */}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-36 bg-gray-800 border-gray-700 text-gray-300">
                  <SelectValue placeholder="반 선택" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">전체 반</SelectItem>
                  <SelectItem value="otter">수달반</SelectItem>
                  <SelectItem value="lion">사자반</SelectItem>
                  <SelectItem value="fox">여우반</SelectItem>
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-gray-700 text-gray-300">
                  <SelectValue placeholder="월 선택" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">전체 기간</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {getMonthLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative w-full sm:w-48">
                <Input
                  placeholder="선생님 이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Result count */}
              <span className="text-gray-500 text-sm whitespace-nowrap ml-auto">
                {filteredInterviews.length}건 표시
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-400 text-lg">해당 조건에 맞는 면담 내역이 없습니다.</p>
              <p className="text-gray-500 text-sm mt-2">필터를 변경해 보세요.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((interview) => {
              const classInfo = getClassColor(interview.class_name);
              const isExpanded = expandedId === interview.id;

              return (
                <Card
                  key={interview.id}
                  className={`bg-gray-900 border-gray-800 transition-all duration-200 ${
                    isExpanded ? 'ring-1 ring-purple-500/30' : 'hover:border-gray-700'
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Collapsed Row */}
                    <button
                      onClick={() => toggleExpand(interview.id)}
                      className="w-full text-left p-5 flex items-center gap-4"
                    >
                      {/* Date */}
                      <div className="hidden sm:block w-24 flex-shrink-0">
                        <p className="text-gray-400 text-xs">
                          {formatDate(interview.created_at)}
                        </p>
                      </div>

                      {/* Class Badge */}
                      <Badge className={`${classInfo.bg} ${classInfo.text} ${classInfo.border} flex-shrink-0`}>
                        {classInfo.label}
                      </Badge>

                      {/* Teacher Name */}
                      <span className="text-white font-medium text-sm flex-shrink-0 w-20 truncate">
                        {interview.teacher_name}
                      </span>

                      {/* Preview of answers */}
                      <div className="hidden md:flex flex-1 gap-2 min-w-0">
                        <span className="text-gray-500 text-xs truncate flex-1">
                          Q1: {truncateText(interview.answer1, 30)}
                        </span>
                        <span className="text-gray-500 text-xs truncate flex-1">
                          Q2: {truncateText(interview.answer2, 30)}
                        </span>
                      </div>

                      {/* Mobile date */}
                      <span className="sm:hidden text-gray-500 text-xs ml-auto">
                        {interview.created_at ? new Date(interview.created_at).toLocaleDateString('ko-KR') : '-'}
                      </span>

                      {/* Expand indicator */}
                      <span
                        className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-800 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 mb-5 pb-4 border-b border-gray-800/50">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">제출일시:</span>
                            <span className="text-gray-300 text-sm">{formatDateTime(interview.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">반:</span>
                            <Badge className={`${classInfo.bg} ${classInfo.text} ${classInfo.border}`}>
                              {classInfo.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">담당 선생님:</span>
                            <span className="text-white text-sm font-medium">{interview.teacher_name}</span>
                          </div>
                        </div>

                        {/* Full Answers */}
                        <div className="space-y-4">
                          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                            <p className="text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                              Q1. 평겜마 콘텐츠 참여 경험
                            </p>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {interview.answer1 || '-'}
                            </p>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                            <p className="text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                              Q2. 인상 깊었던 분
                            </p>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {interview.answer2 || '-'}
                            </p>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                            <p className="text-green-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                              Q3. 동호회
                            </p>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                              {interview.answer3 || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminPasswordGate>
  );
}