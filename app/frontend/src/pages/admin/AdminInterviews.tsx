import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import client from '@/lib/client';
import { classifyClassName, CLASS_LABELS, type ClassKey } from '@/utils/admin/class-keys';
import { CalendarDays } from 'lucide-react';
import {
  adminDeleteGraduationInterview,
  adminUpdateGraduationInterview,
} from '@/lib/api/admin-entities';

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
  member_nickname?: string;
}

interface Member {
  id: number;
  username: string;
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
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [editForm, setEditForm] = useState({
    answer1: '',
    answer2: '',
    answer3: '',
  });
  const [saving, setSaving] = useState(false);
  const [monthDetail, setMonthDetail] = useState<{
    monthKey: string;
    label: string;
    total: number;
    byClass: Record<ClassKey, string[]>;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }

        // Fetch all interviews
        const res = await client.entities.graduation_interviews.queryAll({ query: {}, limit: 500, sort: '-created_at' });
        const items = res?.data?.items || res?.data || [];
        const interviewList: Interview[] = Array.isArray(items) ? items : [];

        // Fetch all members to map user_id -> nickname
        try {
          const membersRes = await client.entities.members.queryAll({ query: {}, limit: 2000 });
          const memberItems = membersRes?.data?.items || membersRes?.data || [];
          const members: Member[] = Array.isArray(memberItems) ? memberItems : [];
          const memberMap = new Map<string, string>();
          members.forEach((m) => {
            memberMap.set(String(m.id), m.username);
          });

          // Attach nickname to each interview
          interviewList.forEach((interview) => {
            if (interview.user_id) {
              interview.member_nickname = memberMap.get(String(interview.user_id)) || undefined;
            }
          });
        } catch (memberErr) {
          console.error('Failed to load members:', memberErr);
        }

        setInterviews(interviewList);
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

  const monthlyGraduationStats = useMemo(() => {
    const now = new Date();
    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    type MonthBucket = {
      monthKey: string;
      label: string;
      total: number;
      byClass: Record<ClassKey, string[]>;
    };

    const buckets: Record<string, MonthBucket> = {};
    monthKeys.forEach((key) => {
      const [year, month] = key.split('-');
      buckets[key] = {
        monthKey: key,
        label: `${year}년 ${parseInt(month)}월`,
        total: 0,
        byClass: { otter: [], lion: [], fox: [] },
      };
    });

    interviews.forEach((interview) => {
      const key = getMonthKey(interview.created_at);
      if (!buckets[key]) return;
      buckets[key].total += 1;
      const classKey = classifyClassName(interview.class_name);
      const nickname = interview.member_nickname || '알 수 없음';
      if (classKey) {
        buckets[key].byClass[classKey].push(nickname);
      }
    });

    return [...monthKeys].reverse().map((key) => buckets[key]);
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

    // Search by teacher name or member nickname
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.teacher_name?.toLowerCase().includes(q) ||
          i.member_nickname?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [interviews, selectedClass, selectedMonth, searchQuery]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openEditDialog = (interview: Interview) => {
    setEditingInterview(interview);
    setEditForm({
      answer1: interview.answer1 || '',
      answer2: interview.answer2 || '',
      answer3: interview.answer3 || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingInterview) return;
    setSaving(true);
    try {
      await adminUpdateGraduationInterview(editingInterview.id, {
        answer1: editForm.answer1,
        answer2: editForm.answer2,
        answer3: editForm.answer3,
      });
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === editingInterview.id
            ? { ...interview, ...editForm }
            : interview
        )
      );
      setEditingInterview(null);
    } catch (err) {
      console.error('Failed to update interview:', err);
      alert('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (interviewId: number) => {
    try {
      await adminDeleteGraduationInterview(interviewId);
      setInterviews(prev => prev.filter(i => i.id !== interviewId));
      if (expandedId === interviewId) {
        setExpandedId(null);
      }
    } catch (err) {
      console.error('Failed to delete interview:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
        <div className="page-container text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">면담 데이터를 불러오는 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="page-container">
        <PageHeader
          title="졸업면담 관리"
          subtitle={`총 ${stats.total}건`}
          backTo="/admin"
          backLabel="대시보드"
          action={
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap">
              {stats.total}건
            </Badge>
          }
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
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

        {/* Monthly Graduation Statistics */}
        <Card className="bg-gray-900 border-gray-800 mb-6 sm:mb-8">
          <CardContent className="card-pad">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-indigo-400 shrink-0" />
              <h2 className="heading-section">월간 졸업면담 통계</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">월을 클릭하면 반별 졸업 명단을 확인할 수 있습니다</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {monthlyGraduationStats.map((month) => (
                <button
                  key={month.monthKey}
                  type="button"
                  onClick={() => setMonthDetail(month)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    month.total > 0
                      ? 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15'
                      : 'border-gray-800 bg-gray-950/50 hover:bg-gray-900'
                  }`}
                >
                  <p className="text-xs text-gray-400 truncate">{month.label}</p>
                  <p className={`text-xl font-bold mt-1 ${month.total > 0 ? 'text-white' : 'text-gray-600'}`}>
                    {month.total}건
                  </p>
                  {month.total > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5">
                        수달 {month.byClass.otter.length}
                      </Badge>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] px-1.5">
                        사자 {month.byClass.lion.length}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1.5">
                        여우 {month.byClass.fox.length}
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  placeholder="선생님/작성자 검색..."
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
                      className="w-full text-left p-3 sm:p-5 flex items-center gap-2 sm:gap-3 min-w-0"
                    >
                      <Badge className={`${classInfo.bg} ${classInfo.text} ${classInfo.border} flex-shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2`}>
                        {classInfo.label}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-emerald-400 font-medium text-xs sm:text-sm truncate">
                          {interview.member_nickname || '알 수 없음'}
                        </p>
                        <p className="text-gray-400 text-[10px] sm:text-xs truncate">
                          {interview.teacher_name} · {formatDate(interview.created_at)}
                        </p>
                      </div>
                      <span
                        className={`text-gray-500 transition-transform duration-200 flex-shrink-0 text-xs ${
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
                            <span className="text-gray-500 text-xs">작성자:</span>
                            <span className="text-emerald-400 text-sm font-medium">{interview.member_nickname || '알 수 없음'}</span>
                          </div>
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

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-800/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                            onClick={() => openEditDialog(interview)}
                          >
                            수정
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-700 text-red-400 hover:bg-red-900/30"
                              >
                                삭제
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">면담 삭제</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  {interview.member_nickname || '알 수 없음'}님의 졸업면담을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                                  취소
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    void handleDelete(interview.id);
                                  }}
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Monthly graduation detail dialog */}
        <Dialog open={!!monthDetail} onOpenChange={(open) => { if (!open) setMonthDetail(null); }}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white truncate">
                {monthDetail?.label} 졸업 명단
              </DialogTitle>
            </DialogHeader>
            {monthDetail && (
              <div className="space-y-4 mt-2">
                <p className="text-sm text-gray-400">총 {monthDetail.total}명</p>
                {(['otter', 'lion', 'fox'] as ClassKey[]).map((classKey) => {
                  const names = monthDetail.byClass[classKey];
                  const colors = {
                    otter: 'border-blue-500/30 bg-blue-500/10',
                    lion: 'border-orange-500/30 bg-orange-500/10',
                    fox: 'border-purple-500/30 bg-purple-500/10',
                  };
                  const textColors = {
                    otter: 'text-blue-400',
                    lion: 'text-orange-400',
                    fox: 'text-purple-400',
                  };
                  return (
                    <div key={classKey} className={`rounded-lg border p-3 ${colors[classKey]}`}>
                      <p className={`text-sm font-semibold mb-2 ${textColors[classKey]}`}>
                        {CLASS_LABELS[classKey]} ({names.length}명)
                      </p>
                      {names.length === 0 ? (
                        <p className="text-xs text-gray-500">해당 반 졸업자 없음</p>
                      ) : (
                        <ul className="space-y-1">
                          {names.map((name, idx) => (
                            <li key={`${classKey}-${name}-${idx}`} className="text-sm text-gray-200 truncate">
                              {idx + 1}. {name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingInterview} onOpenChange={(open) => { if (!open) setEditingInterview(null); }}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">면담 답변 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Q1. 평겜마 콘텐츠 참여 경험</Label>
                <Textarea
                  value={editForm.answer1}
                  onChange={(e) => setEditForm(prev => ({ ...prev, answer1: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Q2. 인상 깊었던 분</Label>
                <Textarea
                  value={editForm.answer2}
                  onChange={(e) => setEditForm(prev => ({ ...prev, answer2: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Q3. 동호회</Label>
                <Textarea
                  value={editForm.answer3}
                  onChange={(e) => setEditForm(prev => ({ ...prev, answer3: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setEditingInterview(null)}
                >
                  취소
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleEditSave}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}