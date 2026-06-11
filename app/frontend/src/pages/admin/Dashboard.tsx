import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminPasswordGate from '@/components/admin/AdminPasswordGate';
import EditableStatCard from '@/components/admin/EditableStatCard';
import client from '@/lib/client';
import PageHeader from '@/components/common/PageHeader';
import { ClipboardList, LayoutDashboard, RotateCcw } from 'lucide-react';
import {
  type DashboardStatKey,
  type DashboardStatsComputed,
  type DashboardStatsOverrides,
  loadDashboardOverrides,
  setDashboardOverride,
  clearDashboardOverrides,
  resolveStat,
  isStatOverridden,
} from '@/utils/admin/dashboard-stats-storage';
import { classifyClassName } from '@/utils/admin/class-keys';
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

function calcRemainingByClass(teachers: { class_name?: string; game_category?: string; status?: string; max_students: number; current_students: number }[]) {
  const result = { otter: 0, lion: 0, fox: 0 };
  teachers.forEach((t) => {
    if (t.status !== 'recruiting') return;
    const slots = Math.max(0, t.max_students - t.current_students);
    const key = classifyClassName(t.class_name || '') || classifyClassName(t.game_category || '');
    if (key === 'otter') result.otter += slots;
    else if (key === 'lion') result.lion += slots;
    else if (key === 'fox') result.fox += slots;
  });
  return result;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [computed, setComputed] = useState<DashboardStatsComputed>({
    totalApplications: 0,
    otterCount: 0,
    lionCount: 0,
    foxCount: 0,
    remainingOtter: 0,
    remainingLion: 0,
    remainingFox: 0,
  });
  const [overrides, setOverrides] = useState<DashboardStatsOverrides>(() => loadDashboardOverrides());
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [newInterviewCount, setNewInterviewCount] = useState(0);
  const [interviewChartData, setInterviewChartData] = useState<{ month: string; count: number }[]>([]);
  const [applicationChartData, setApplicationChartData] = useState<{ month: string; 수달반: number; 사자반: number; 여우반: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const display = useMemo(() => {
    const keys = Object.keys(computed) as DashboardStatKey[];
    return keys.reduce((acc, key) => {
      acc[key] = resolveStat(key, computed, overrides);
      return acc;
    }, {} as DashboardStatsComputed);
  }, [computed, overrides]);

  const hasAnyOverride = useMemo(
    () => (Object.keys(overrides) as DashboardStatKey[]).some((k) => isStatOverridden(k, overrides)),
    [overrides]
  );

  const handleSaveOverride = useCallback((key: DashboardStatKey, value: number) => {
    setOverrides(setDashboardOverride(key, value));
  }, []);

  const handleResetOverride = useCallback((key: DashboardStatKey) => {
    setOverrides(setDashboardOverride(key, null));
  }, []);

  const handleResetAllOverrides = useCallback(() => {
    clearDashboardOverrides();
    setOverrides({});
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          window.location.href = '/login';
          return;
        }

        const teachersRes = await client.entities.teachers.query({ query: {}, limit: 50 });
        const teachers = teachersRes?.data?.items || [];

        const appsRes = await client.entities.applications.queryAll({
          query: {},
          limit: 2000,
          sort: '-created_at',
        });
        const apps = appsRes?.data?.items || appsRes?.data || [];

        const remaining = calcRemainingByClass(teachers);

        setComputed({
          totalApplications: apps.length,
          otterCount: apps.filter((a) => a.class_name === '수달반').length,
          lionCount: apps.filter((a) => a.class_name === '사자반').length,
          foxCount: apps.filter((a) => a.class_name === '여우반').length,
          remainingOtter: remaining.otter,
          remainingLion: remaining.lion,
          remainingFox: remaining.fox,
        });

        const now2 = new Date();
        const appMonthKeys: string[] = [];
        const appMonthMap: Record<string, { 수달반: number; 사자반: number; 여우반: number }> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          appMonthKeys.push(key);
          appMonthMap[key] = { 수달반: 0, 사자반: 0, 여우반: 0 };
        }

        apps.forEach((app) => {
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

        setApplicationChartData(
          appMonthKeys.map((key) => ({
            month: `${parseInt(key.split('-')[1])}월`,
            수달반: appMonthMap[key].수달반,
            사자반: appMonthMap[key].사자반,
            여우반: appMonthMap[key].여우반,
          }))
        );

        const logsRes = await client.entities.admin_logs.queryAll({
          query: {},
          sort: '-created_at',
          limit: 10,
        });
        setLogs(logsRes?.data?.items || []);

        try {
          const interviewsRes = await client.entities.graduation_interviews.queryAll({ limit: 500 });
          const interviews = interviewsRes?.data?.items || interviewsRes?.data || [];
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const recentCount = interviews.filter((interview: { created_at?: string }) => {
            const createdAt = new Date(interview.created_at || '');
            return createdAt > oneDayAgo;
          }).length;
          setNewInterviewCount(recentCount);

          const now = new Date();
          const monthMap: Record<string, number> = {};
          const monthKeys: string[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthMap[key] = 0;
            monthKeys.push(key);
          }

          interviews.forEach((interview: { created_at?: string }) => {
            if (!interview.created_at) return;
            const createdAt = new Date(interview.created_at);
            const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (key in monthMap) monthMap[key]++;
          });

          setInterviewChartData(
            monthKeys.map((key) => ({
              month: `${parseInt(key.split('-')[1])}월`,
              count: monthMap[key],
            }))
          );
        } catch {
          // ignore
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
      <div className="page-container text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <AdminPasswordGate>
      <div className="page-container">
        <PageHeader
          title="관리자 대시보드"
          subtitle="통계 및 활동 요약 · 연필 아이콘으로 수치 수정"
          action={
            <div className="flex items-center gap-2">
              {hasAnyOverride && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-700/50 text-amber-300 hover:bg-amber-950/30 text-xs"
                  onClick={handleResetAllOverrides}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  수치 초기화
                </Button>
              )}
              <LayoutDashboard className="h-5 w-5 text-purple-400 hidden sm:block" />
            </div>
          }
        />

        {newInterviewCount > 0 && (
          <Link to="/admin/interviews">
            <div className="mb-6 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/15 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-300 font-semibold text-sm sm:text-base truncate">
                    새 졸업면담 {newInterviewCount}건
                  </p>
                  <p className="text-amber-200/60 text-xs sm:text-sm truncate">최근 24시간 접수</p>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black font-bold text-sm">
                  {newInterviewCount}
                </span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <EditableStatCard
            label="총 신청"
            value={display.totalApplications}
            isOverridden={isStatOverridden('totalApplications', overrides)}
            onSave={(v) => handleSaveOverride('totalApplications', v)}
            onReset={() => handleResetOverride('totalApplications')}
          />
          <EditableStatCard
            label="수달반 신청"
            value={display.otterCount}
            labelClassName="text-blue-400"
            borderClassName="border-blue-500/30"
            isOverridden={isStatOverridden('otterCount', overrides)}
            onSave={(v) => handleSaveOverride('otterCount', v)}
            onReset={() => handleResetOverride('otterCount')}
          />
          <EditableStatCard
            label="사자반 신청"
            value={display.lionCount}
            labelClassName="text-orange-400"
            borderClassName="border-orange-500/30"
            isOverridden={isStatOverridden('lionCount', overrides)}
            onSave={(v) => handleSaveOverride('lionCount', v)}
            onReset={() => handleResetOverride('lionCount')}
          />
          <EditableStatCard
            label="여우반 신청"
            value={display.foxCount}
            labelClassName="text-purple-400"
            borderClassName="border-purple-500/30"
            isOverridden={isStatOverridden('foxCount', overrides)}
            onSave={(v) => handleSaveOverride('foxCount', v)}
            onReset={() => handleResetOverride('foxCount')}
          />
        </div>

        <h2 className="heading-section text-gray-300 mb-3">반별 남은 자리</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <EditableStatCard
            label="수달반 잔여"
            value={display.remainingOtter}
            labelClassName="text-green-400"
            borderClassName="border-green-500/30"
            isOverridden={isStatOverridden('remainingOtter', overrides)}
            onSave={(v) => handleSaveOverride('remainingOtter', v)}
            onReset={() => handleResetOverride('remainingOtter')}
          />
          <EditableStatCard
            label="사자반 잔여"
            value={display.remainingLion}
            labelClassName="text-green-400"
            borderClassName="border-green-500/30"
            isOverridden={isStatOverridden('remainingLion', overrides)}
            onSave={(v) => handleSaveOverride('remainingLion', v)}
            onReset={() => handleResetOverride('remainingLion')}
          />
          <EditableStatCard
            label="여우반 잔여"
            value={display.remainingFox}
            labelClassName="text-green-400"
            borderClassName="border-green-500/30"
            isOverridden={isStatOverridden('remainingFox', overrides)}
            onSave={(v) => handleSaveOverride('remainingFox', v)}
            onReset={() => handleResetOverride('remainingFox')}
          />
        </div>

        {applicationChartData.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-6 sm:mb-8">
            <CardContent className="card-pad">
              <h2 className="heading-section mb-4">월간 신청 통계</h2>
              <div className="h-44 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                      formatter={(value: number, name: string) => [`${value}건`, name]}
                    />
                    <Legend wrapperStyle={{ color: '#D1D5DB', fontSize: 12 }} />
                    <Bar dataKey="수달반" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="사자반" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="여우반" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {interviewChartData.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-6 sm:mb-8">
            <CardContent className="card-pad">
              <h2 className="heading-section mb-4">월별 면담 제출 통계</h2>
              <div className="h-44 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interviewChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                      formatter={(value: number) => [`${value}건`, '제출 수']}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="heading-section mb-4">최근 활동 내역</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="card-pad">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">활동 내역이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <span className="text-xl flex-shrink-0">{getActionIcon(log.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          <span className="font-semibold">{log.target_name}</span>
                          <span className="text-gray-400 ml-2">({log.target_class})</span>
                        </p>
                        <p className="text-xs text-gray-500 truncate">{log.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">{getRelativeTime(log.created_at)}</p>
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
