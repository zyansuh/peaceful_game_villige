import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminPasswordGate from '@/components/AdminPasswordGate';
import client from '@/lib/client';

interface Application {
  id: number;
  nickname: string;
  discord_id: string;
  age: number;
  game_experience: string;
  teacher_id: number;
  class_name: string;
  status: string;
  admin_memo: string;
  created_at: string;
}

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          client.auth.toLogin();
          return;
        }

        const appsRes = await client.entities.applications.query({ query: {}, limit: 100, sort: '-created_at' });
        setApplications(appsRes?.data?.items || []);

        const teachersRes = await client.entities.teachers.query({ query: {}, limit: 50 });
        setTeachers(teachersRes?.data?.items || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.nickname || '알 수 없음';
  };

  const updateStatus = async (appId: number, newStatus: string) => {
    try {
      await client.entities.applications.update({
        id: String(appId),
        data: { status: newStatus },
      });
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">승인대기</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">승인</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">거절</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <h1 className="text-2xl font-bold text-white">신청 관리</h1>
        <Link to="/admin">
          <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            ← 대시보드
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">아직 신청 내역이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{app.nickname}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">반: </span>
                        <span className="text-gray-300">{app.class_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">선생님: </span>
                        <span className="text-gray-300">{getTeacherName(app.teacher_id)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">디스코드: </span>
                        <span className="text-gray-300">{app.discord_id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">신청일: </span>
                        <span className="text-gray-300">{app.created_at ? new Date(app.created_at).toLocaleDateString('ko-KR') : '-'}</span>
                      </div>
                    </div>
                    {app.game_experience && (
                      <p className="text-gray-400 text-sm mt-2">경력: {app.game_experience}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value)}
                    >
                      <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="pending">승인대기</SelectItem>
                        <SelectItem value="approved">승인</SelectItem>
                        <SelectItem value="rejected">거절</SelectItem>
                      </SelectContent>
                    </Select>
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