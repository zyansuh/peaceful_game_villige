import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, LogIn, AlertCircle, Info } from 'lucide-react';
import client from '@/lib/client';

interface Application {
  id: number;
  teacher_id: number;
  class_name: string;
  status: string;
}

interface Teacher {
  id: number;
  nickname: string;
}

interface ExistingInterview {
  id: number;
  answer1: string;
  answer2: string;
  answer3: string;
  teacher_id: number;
  teacher_name: string;
  class_name: string;
}

export default function GraduationInterview() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [className, setClassName] = useState('');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [noApplication, setNoApplication] = useState(false);
  const [existingInterview, setExistingInterview] = useState<ExistingInterview | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await client.auth.me();
        if (!userRes?.data) {
          setLoggedIn(false);
          setLoading(false);
          return;
        }
        setLoggedIn(true);

        // Check if already submitted
        const existingRes = await client.entities.graduation_interviews.query({ query: {} });
        const existingItems = existingRes?.data?.items || existingRes?.data || [];
        if (Array.isArray(existingItems) && existingItems.length > 0) {
          const existing = existingItems[0] as ExistingInterview;
          setExistingInterview(existing);
          setIsEditMode(true);
          setAnswer1(existing.answer1 || '');
          setAnswer2(existing.answer2 || '');
          setAnswer3(existing.answer3 || '');
          setClassName(existing.class_name || '');

          // Fetch teacher info from existing interview
          if (existing.teacher_id) {
            try {
              const tRes = await client.entities.teachers.get({ id: String(existing.teacher_id) });
              if (tRes?.data) {
                setTeacher(tRes.data);
              }
            } catch {
              // Use stored teacher name as fallback
              setTeacher({ id: existing.teacher_id, nickname: existing.teacher_name || '알 수 없음' });
            }
          }

          setLoading(false);
          return;
        }

        // Fetch user's applications
        const appRes = await client.entities.applications.query({ query: {} });
        const appItems = appRes?.data?.items || appRes?.data || [];
        const apps: Application[] = Array.isArray(appItems) ? appItems : [];
        const approvedApp = apps.find((a) => a.status === 'approved') || apps[0];

        if (!approvedApp) {
          setNoApplication(true);
          setLoading(false);
          return;
        }

        setClassName(approvedApp.class_name || '');
        setAutoFilled(true);

        // Fetch teacher info
        try {
          const tRes = await client.entities.teachers.get({ id: String(approvedApp.teacher_id) });
          if (tRes?.data) {
            setTeacher(tRes.data);
          }
        } catch {
          // Teacher not found
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!answer1.trim() || !answer2.trim() || !answer3.trim()) {
      alert('모든 질문에 답변해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        teacher_id: teacher?.id || 0,
        teacher_name: teacher?.nickname || '알 수 없음',
        class_name: className,
        answer1: answer1.trim(),
        answer2: answer2.trim(),
        answer3: answer3.trim(),
      };

      if (isEditMode && existingInterview) {
        await client.entities.graduation_interviews.update({
          id: String(existingInterview.id),
          data: payload,
        });
      } else {
        await client.entities.graduation_interviews.create({
          data: payload,
        });
      }
      navigate('/mypage');
    } catch (err) {
      console.error('Failed to submit interview:', err);
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <LogIn className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-400 mb-6">졸업면담지를 작성하려면 로그인해주세요.</p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            >
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



  if (noApplication) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">신청 내역이 없습니다</h2>
            <p className="text-gray-400 mb-6">먼저 담당 선생님을 신청해주세요.</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              반 둘러보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📋 졸업면담지</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <span>담당 선생님: <span className="text-white font-medium">{teacher?.nickname || '알 수 없음'}</span></span>
          <span>|</span>
          <span>반: <span className="text-white font-medium">{className || '알 수 없음'}</span></span>
        </div>
      </div>

      {/* Auto-fill info message */}
      {autoFilled && !isEditMode && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p className="text-blue-300 text-sm">
            신청 내역에서 담당 선생님과 반 정보가 자동으로 연동되었습니다.
          </p>
        </div>
      )}

      {/* Edit mode banner */}
      {isEditMode && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            이미 졸업면담지를 제출하셨습니다. 아래에서 내용을 수정할 수 있습니다.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Question 1 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-1">
              1. 평겜마 콘텐츠를 참여하신 경험이 있으실까요? 참여하셨다면 느낀점이 있으실까요?
            </h3>
            <p className="text-gray-500 text-sm mb-3">
              ex) 일반내전, 공식내전, 천타온, 옵스나이트 등
            </p>
            <Textarea
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              placeholder="답변을 입력해주세요..."
              className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Question 2 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-1">
              2. 최근 함께한 사람 중 인상 깊거나 좋았던 분이 있으실까요?
            </h3>
            <p className="text-gray-500 text-sm mb-3">
              *담당선생님 제외
            </p>
            <Textarea
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              placeholder="답변을 입력해주세요..."
              className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Question 3 */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-1">
              3. 동호회 가입하셨다면 아래 답변에 동호회 명을 적어주세요.
            </h3>
            <Textarea
              value={answer3}
              onChange={(e) => setAnswer3(e.target.value)}
              placeholder="동호회 명을 입력해주세요..."
              className="bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 min-h-[80px] resize-none"
            />
            {/* Info box */}
            <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-sm font-medium mb-1">💰 동호회 가입 시 추가 포인트!</p>
              <p className="text-purple-200/80 text-sm">
                졸업포인트(15,000P) + 동호회 가입포인트(5,000P) = <span className="font-bold text-purple-200">총 20,000P</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 py-6 text-lg font-semibold"
        >
          {submitting
            ? (isEditMode ? '수정 중...' : '제출 중...')
            : (isEditMode ? '졸업면담지 수정하기' : '졸업면담지 제출하기')
          }
        </Button>
      </div>
    </div>
  );
}