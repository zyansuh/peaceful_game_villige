import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PartyPopper, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ApplicationComplete() {
  const [searchParams] = useSearchParams();
  const teacherName = searchParams.get('teacher') || '선생님';
  const className = searchParams.get('class') || '';
  const position = searchParams.get('position') || '';
  const tier = searchParams.get('tier') || '';
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#F97316', '#8B5CF6', '#10B981', '#F59E0B'],
    });

    // Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#F97316', '#F59E0B', '#10B981'],
      });
    }, 300);

    // Delayed sparkle
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FFF', '#3B82F6'],
        shapes: ['star'],
        scalar: 1.2,
      });
    }, 800);
  }, []);

  const classDisplayName = className === 'overwatch' ? '수달반' : className === 'pubg' ? '사자반' : className === 'valorant' ? '여우반' : '';
  const classColor = className === 'overwatch' ? 'from-blue-500 to-cyan-400' : className === 'pubg' ? 'from-orange-500 to-amber-400' : 'from-purple-500 to-pink-400';

  return (
    <div className="page-container max-w-lg relative">
      {/* Floating celebration particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce text-2xl"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 2)}s`,
            }}
          >
            {['🎉', '🎊', '⭐', '🌟', '✨', '🎈'][i]}
          </div>
        ))}
      </div>

      <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
        {/* Top gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${classColor || 'from-blue-500 to-purple-500'}`} />

        <CardContent className="p-8 text-center">
          {/* Celebration icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <PartyPopper className="absolute -top-2 -right-2 w-7 h-7 text-yellow-400 animate-bounce" />
              <Star className="absolute -bottom-1 -left-2 w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">🎉 축하합니다!</h1>
          <p className="text-gray-300 mb-2">신청이 접수되었습니다!</p>
          <p className="text-gray-400 text-sm mb-6">
            관리자 승인 후 담당 선생님으로 배정됩니다. 마이페이지에서 상태를 확인할 수 있습니다.
          </p>

          {/* Teacher Summary Card */}
          <div className="bg-gray-800/70 rounded-xl p-5 mb-6 border border-gray-700/50 text-left">
            <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">📋 배정 정보 요약</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">담당 선생님</span>
                <span className="text-white font-bold text-lg">{teacherName}</span>
              </div>
              {classDisplayName && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">소속 반</span>
                  <span className={`font-semibold bg-gradient-to-r ${classColor} bg-clip-text text-transparent`}>
                    {classDisplayName}
                  </span>
                </div>
              )}
              {position && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">포지션</span>
                  <span className="text-gray-200">{position}</span>
                </div>
              )}
              {tier && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">선생님 티어</span>
                  <span className="text-gray-200">{tier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              ✅ 관리자 확인 후 디스코드를 통해 안내드릴 예정입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-12 text-base font-semibold">
                🏠 메인으로 돌아가기
              </Button>
            </Link>
            <Link to="/mypage">
              <Button variant="outline" className="w-full border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white h-12 text-base font-semibold">
                📄 마이페이지에서 확인하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}