import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    otterCount: 0,
    lionCount: 0,
    foxCount: 0,
    remainingSlots: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
          <Link to="/">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              메인으로
            </Button>
          </Link>
        </div>

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

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/applications">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">📋 신청 관리</h3>
                <p className="text-gray-400 text-sm">신입 신청 목록 확인, 승인/거절 처리</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/admin/teachers">
            <Card className="bg-gray-900 border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">👨‍🏫 선생님 관리</h3>
                <p className="text-gray-400 text-sm">선생님 등록, 수정, 상태 변경</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminPasswordGate>
  );
}