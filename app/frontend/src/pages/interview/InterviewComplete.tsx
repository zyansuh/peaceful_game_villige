import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PartyPopper, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InterviewComplete() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
    });

    // Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#8B5CF6', '#3B82F6', '#EC4899'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#3B82F6'],
      });
    }, 300);

    // Delayed sparkle
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FFF', '#8B5CF6'],
        shapes: ['star'],
        scalar: 1.2,
      });
    }, 800);
  }, []);

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
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500" />

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

          <h1 className="text-2xl font-bold text-white mb-2">🎉 면담이 정상적으로 접수되었습니다</h1>
          <p className="text-gray-300 mb-6">졸업면담지가 성공적으로 제출되었습니다.</p>

          {/* Important notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5 mb-6">
            <p className="text-amber-300 text-sm font-semibold mb-1">⚠️ 안내사항</p>
            <p className="text-amber-200/90 text-sm leading-relaxed">
              디스코드에 작은온기 서버태그는 제거해주시고 신입방은 정리부탁드립니다
            </p>
          </div>

          {/* Status info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              ✅ 담당 선생님이 확인 후 안내드릴 예정입니다.
            </p>
          </div>

          <Link to="/mypage">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-12 text-base font-semibold">
              📋 마이페이지에서 확인하기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}