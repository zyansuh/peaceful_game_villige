import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface AdminLog {
  id: number;
  action: string;
  target_type: string;
  target_name: string;
  target_class: string;
  details: string;
  admin_email: string;
  created_at: string;
}

function getActionIcon(action: string): string {
  switch (action) {
    case 'add': return '➕';
    case 'edit': return '✏️';
    case 'delete': return '🗑️';
    default: return '📝';
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    otterCount: 0,
    lionCount: 0,
    foxCount: 0,
    remainingSlots: 0,
  });
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [newInterviewCount, setNewInterviewCount] = useState(0);
  const [interviewChartData, setInterviewChartData] = useState<{ month: string; count: number }[]>([]);
  const [applicationChartData, setApplicationChartData] = useState<{ month: string; 수달반: number; 사자반: number; 여우반: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }

        // Fetch teachers for stats
        const teachersRes = await client.entities.teachers.query({ query: {}, limit: 50 });
        const teachers = teachersRes?.data?.items || [];

        // Fetch user's applications to get count
        const appsRes = await client.entities.applications.query({ query: {}, limit: 100 });
        const apps = appsRes?.data?.items || [];

        const remaining = teachers.reduce((sum: number, t: any) => {
          if (t.status === 'recruiting') return sum + (t.max_students - t.current_students);
          return sum;
        }, 0);

        setStats({
          totalApplications: apps.length,
          otterCount: apps.filter((a: any) => a.class_name === '수달반').length,
          lionCount: apps.filter((a: any) => a.class_name === '사자반').length,
          foxCount: apps.filter((a: any) => a.class_name === '여우반').length,
          remainingSlots: remaining,
        });

        // Build monthly application chart data (last 6 months, grouped by class)
        const now2 = new Date();
        const appMonthKeys: string[] = [];
        const appMonthMap: Record<string, { 수달반: number; 사자반: number; 여우반: number }> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          appMonthKeys.push(key);
          appMonthMap[key] = { 수달반: 0, 사자반: 0, 여우반: 0 };
        }

        apps.forEach((app: any) => {
          if (!app.created_at) return;
          const createdAt = new Date(app.created_at);
          const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
          if (key in appMonthMap) {
            const className = app.class_name as string;
            if (className === '수달반') appMonthMap[key].수달반++;
            else if (className === '사자반') appMonthMap[key].사자반++;
            else if (className === '여우반') appMonthMap[key].여우반++;
          }
        });

        const appChartData = appMonthKeys.map((key) => ({
          month: `${parseInt(key.split('-')[1])}월`,
          수달반: appMonthMap[key].수달반,
          사자반: appMonthMap[key].사자반,
          여우반: appMonthMap[key].여우반,
        }));
        setApplicationChartData(appChartData);

        // Fetch admin logs
        const logsRes = await client.entities.admin_logs.query({ query: {}, sort: '-created_at', limit: 10 });
        setLogs(logsRes?.data?.items || []);

        // Fetch graduation interviews for notification badge + chart
        try {
          const interviewsRes = await client.entities.graduation_interviews.queryAll({});
          const interviews = interviewsRes?.data || [];
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const recentCount = interviews.filter((interview: any) => {
            const createdAt = new Date(interview.created_at);
            return createdAt > oneDayAgo;
          }).length;
          setNewInterviewCount(recentCount);

          // Build chart data for last 6 months
          const now = new Date();
          const monthMap: Record<string, number> = {};
          const monthKeys: string[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthMap[key] = 0;
            monthKeys.push(key);
          }

          interviews.forEach((interview: any) => {
            if (!interview.created_at) return;
            const createdAt = new Date(interview.created_at);
            const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (key in monthMap) {
              monthMap[key]++;
            }
          });

          const chartData = monthKeys.map((key) => ({
            month: `${parseInt(key.split('-')[1])}월`,
            count: monthMap[key],
          }));
          setInterviewChartData(chartData);
        } catch {
          // graduation_interviews might not exist yet
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
        </div>

        {/* New Interview Notification */}
        {newInterviewCount > 0 && (
          <Link to="/admin/interviews">
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <p className="text-amber-300 font-semibold">
                    새 졸업면담 {newInterviewCount}건 접수
                  </p>
                  <p className="text-amber-200/60 text-sm">최근 24시간 내 접수된 면담지입니다</p>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black font-bold text-sm">
                  {newInterviewCount}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm">총 신청 수</p>
              <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-blue-500/30">
            <CardContent className="p-6">
              <p className="text-blue-400 text-sm">수달반 (오버워치)</p>
              <p className="text-3xl font-bold text-white">{stats.otterCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-orange-500/30">
            <CardContent className="p-6">
              <p className="text-orange-400 text-sm">사자반 (배그)</p>
              <p className="text-3xl font-bold text-white">{stats.lionCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-purple-500/30">
            <CardContent className="p-6">
              <p className="text-purple-400 text-sm">여우반 (발로란트)</p>
              <p className="text-3xl font-bold text-white">{stats.foxCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm">남은 자리</p>
              <p className="text-3xl font-bold text-green-400">{stats.remainingSlots}명</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Application Statistics Chart */}
        {applicationChartData.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📊 월간 신청 통계</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6',
                      }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number, name: string) => [`${value}건`, name]}
                    />
                    <Legend
                      wrapperStyle={{ color: '#D1D5DB', fontSize: 12 }}
                    />
                    <Bar dataKey="수달반" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="사자반" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="여우반" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Submission Trend Chart */}
        {interviewChartData.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📊 월별 면담 제출 통계</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interviewChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#4B5563' }}
                      tickLine={{ stroke: '#4B5563' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6',
                      }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value: number) => [`${value}건`, '제출 수']}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">📜 최근 활동 내역</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">활동 내역이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                    >
                      <span className="text-xl flex-shrink-0">{getActionIcon(log.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          <span className="font-semibold">{log.target_name}</span>
                          <span className="text-gray-400 ml-2">({log.target_class})</span>
                        </p>
                        <p className="text-xs text-gray-500">{log.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{getRelativeTime(log.created_at)}</p>
                        <p className="text-xs text-gray-600 truncate max-w-[120px]">{log.admin_email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPasswordGate>
  );
}