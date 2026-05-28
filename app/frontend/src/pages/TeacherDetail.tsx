import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import client from '@/lib/client';

interface Teacher {
  id: number;
  game_category: string;
  class_name: string;
  nickname: string;
  intro: string;
  detail_intro: string;
  tier: string;
  active_time: string;
  personality: string;
  teaching_style: string;
  position: string;
  message: string;
  profile_image: string;
  max_students: number;
  current_students: number;
  status: string;
}

interface Review {
  id: number;
  user_id: string;
  teacher_id: string;
  teacher_name: string;
  class_name: string;
  rating: number;
  content: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export default function TeacherDetail() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Review form state
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeacher = useCallback(async () => {
    try {
      setLoading(true);
      const res = await client.entities.teachers.get({ id: teacherId || '' });
      if (res?.data) {
        setTeacher(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await client.apiCall.invoke({
        url: '/api/v1/entities/reviews/all',
        method: 'GET',
        data: {
          query: JSON.stringify({ teacher_id: teacherId }),
          sort: '-created_at',
          limit: 50,
          skip: 0,
        },
      });
      if (res?.data?.items) {
        setReviews(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [teacherId]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await client.auth.me();
      if (res?.data) {
        setUser(res.data);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchTeacher();
    fetchReviews();
    checkAuth();
  }, [fetchTeacher, fetchReviews, checkAuth]);

  // Re-fetch data when page becomes visible (e.g., user navigates back after applying)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTeacher();
      }
    };
    const handleFocus = () => {
      fetchTeacher();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchTeacher]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    const userEmail = user?.email || user?.username || '익명';

    try {
      setSubmitting(true);
      await client.entities.reviews.create({
        data: {
          teacher_id: String(teacherId),
          teacher_name: teacher?.nickname || '',
          class_name: teacher?.class_name || '',
          rating: 5,
          content: reviewContent.trim(),
          nickname: userEmail,
        },
      });
      // Reset form and refresh reviews
      setReviewContent('');
      await fetchReviews();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getClassColor = (className: string) => {
    if (className === '수달반') return '#3B82F6';
    if (className === '사자반') return '#F97316';
    if (className === '여우반') return '#8B5CF6';
    return '#3B82F6';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">선생님 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isFull = teacher.current_students >= teacher.max_students || teacher.status !== 'recruiting';
  const classColor = getClassColor(teacher.class_name);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mb-6 inline-block">
        ← 뒤로가기
      </button>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl shrink-0">
              👨‍🏫
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{teacher.nickname} {teacher.position}</h1>
              <p className="text-gray-400">{teacher.class_name} · {teacher.game_category === 'overwatch' ? '오버워치' : teacher.game_category === 'pubg' ? '배틀그라운드' : '발로란트'}</p>
              <div className="flex gap-2 mt-2">
                {teacher.status === 'recruiting' && !isFull && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">모집중</Badge>
                )}
                {isFull && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">마감</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8 space-y-3">
            {(() => {
              let gender = '';
              let birthYear = '';
              if (teacher.detail_intro) {
                const genderMatch = teacher.detail_intro.match(/성별:\s*([^\s|]+)/);
                const birthMatch = teacher.detail_intro.match(/출생년도:\s*([^\s|]+)/);
                if (genderMatch) gender = genderMatch[1];
                if (birthMatch) birthYear = birthMatch[1];
              }
              return (
                <>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">성별 :</span>
                    <span className="text-gray-200">{gender || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">출생년도 :</span>
                    <span className="text-gray-200">{birthYear || '-'}</span>
                  </div>
                </>
              );
            })()}
            <div className="flex">
              <span className="text-gray-500 w-24 shrink-0">MBTI :</span>
              <span className="text-gray-200">{teacher.personality || '-'}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-24 shrink-0">게임유형 :</span>
              <span className="text-gray-200">{teacher.teaching_style || '-'}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-24 shrink-0">소개 :</span>
              <span className="text-gray-200">{teacher.intro || '-'}</span>
            </div>
            <div className="flex items-center pt-2 border-t border-gray-700">
              <span className="text-gray-500 w-24 shrink-0">인원현황</span>
              <span className={`font-semibold ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                {teacher.current_students} / {teacher.max_students} 명
              </span>
              {isFull && (
                <Badge className="ml-3 bg-red-500/20 text-red-400 border-red-500/30">마감</Badge>
              )}
            </div>
          </div>

          {/* Message */}
          {teacher.message && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
              <p className="text-gray-200 italic">"{teacher.message}"</p>
            </div>
          )}

          {/* Action Button */}
          {isFull ? (
            <Button disabled className="w-full bg-gray-700 text-gray-500 cursor-not-allowed py-6 text-lg">
              정원 마감 - 선택 불가
            </Button>
          ) : (
            <Link to={`/apply/${teacher.id}`}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 py-6 text-lg">
                이 선생님 선택하기
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="bg-gray-900 border-gray-800 mt-6">
        <CardContent className="p-8">
          {/* Reviews Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">댓글</h2>
            {reviews.length > 0 && (
              <span className="text-gray-400 text-sm">{reviews.length}개</span>
            )}
          </div>

          {/* Review Form */}
          {user ? (
            <form onSubmit={handleSubmitReview} className="mb-8 p-5 rounded-lg border border-gray-700 bg-gray-800/50">
              <h3 className="text-white font-semibold mb-4">댓글 작성</h3>
              <div className="mb-2">
                <span className="text-gray-400 text-sm">작성자: </span>
                <span className="text-blue-400 text-sm font-medium">{user?.email || user?.username || '사용자'}</span>
              </div>
              <div className="mb-4">
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="댓글을 작성해주세요"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                  maxLength={500}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !reviewContent.trim()}
                className="text-white border-0"
                style={{ backgroundColor: classColor }}
              >
                {submitting ? '등록 중...' : '댓글 등록'}
              </Button>
            </form>
          ) : (
            <div className="mb-8 p-5 rounded-lg border border-gray-700 bg-gray-800/30 text-center">
              <p className="text-gray-400">로그인 후 리뷰를 작성할 수 있습니다</p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="mt-3 bg-gray-700 hover:bg-gray-600 text-white border-0"
              >
                로그인
              </Button>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <p className="text-gray-400 text-center py-4">리뷰 로딩 중...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-lg bg-gray-800/40 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-medium text-sm">{review.nickname || '익명'}</span>
                    <span className="text-gray-500 text-xs">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}