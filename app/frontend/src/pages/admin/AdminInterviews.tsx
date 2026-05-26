import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function AdminInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
          return;
        }

        const res = await client.entities.graduation_interviews.query({ query: {}, limit: 200, sort: '-created_at' });
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

  const getMonthKey = (dateStr: string) => {
    if (!dateStr) return 'unknown';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthLabel = (key: string) => {
    if (key === 'unknown') return '날짜 없음';
    const [year, month] = key.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  // Get unique months
  const months = [...new Set(interviews.map((i) => getMonthKey(i.created_at)))].sort().reverse();

  // Filter interviews by month
  const filteredInterviews = selectedMonth === 'all'
    ? interviews
    : interviews.filter((i) => getMonthKey(i.created_at) === selectedMonth);

  // Monthly stats
  const monthlyStats = months.map((m) => ({
    key: m,
    label: getMonthLabel(m),
    count: interviews.filter((i) => getMonthKey(i.created_at) === m).length,
  }));

  const getClassBadge = (className: string) => {
    if (className.includes('수달') || className.includes('overwatch')) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">수달반</Badge>;
    }
    if (className.includes('사자') || className.includes('pubg')) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">사자반</Badge>;
    }
    if (className.includes('여우') || className.includes('valorant')) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">여우반</Badge>;
    }
    return <Badge variant="outline">{className}</Badge>;
  };

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
          <h1 className="text-2xl font-bold text-white">졸업면담 관리</h1>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              ← 대시보드
            </Button>
          </Link>
        </div>

        {/* Monthly Statistics */}
        {monthlyStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{interviews.length}</p>
              <p className="text-xs text-gray-400">전체 면담</p>
            </div>
            {monthlyStats.slice(0, 3).map((stat) => (
              <div key={stat.key} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-200">{stat.count}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-gray-400 text-sm">필터:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-300">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">전체</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-gray-500 text-sm">({filteredInterviews.length}건)</span>
        </div>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">졸업면담 내역이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <Card key={interview.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getClassBadge(interview.class_name)}
                      <span className="text-white font-medium">담당: {interview.teacher_name}</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {interview.created_at ? new Date(interview.created_at).toLocaleDateString('ko-KR') : '-'}
                    </span>
                  </div>

                  {/* Answers */}
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Q1. 평겜마 콘텐츠 참여 경험</p>
                      <p className="text-gray-200 text-sm">{interview.answer1}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Q2. 인상 깊었던 분</p>
                      <p className="text-gray-200 text-sm">{interview.answer2}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-1">Q3. 동호회</p>
                      <p className="text-gray-200 text-sm">{interview.answer3}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminPasswordGate>
  );
}