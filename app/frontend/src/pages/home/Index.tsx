import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ClipboardList, Megaphone, Gamepad2 } from 'lucide-react';
import { GAME_CLASSES } from '@/constants/game-classes';

export default function Index() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden py-10 sm:py-16 md:py-24">
        <div className="relative z-10 text-center px-3 sm:px-4">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
            평화로운 게임마을
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 mb-2 flex items-center justify-center gap-1.5">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-purple-400" />
            <span className="truncate">신입 담당선생님 배정</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto px-2">
            평겜마 적응을 돕는 담당선생님을 선택하세요
          </p>
        </div>
      </div>

      <div className="page-container pb-10 sm:pb-16">
        <h2 className="heading-section text-center text-gray-100 mb-6 sm:mb-10">
          반을 선택하세요
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {GAME_CLASSES.map((cls) => (
            <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
              <Card
                className={`overflow-hidden border ${cls.borderColor} ${cls.hoverBorder} transition-all duration-300 hover:shadow-xl ${cls.bgGlow} sm:hover:-translate-y-1 cursor-pointer bg-gray-900/80 ${cls.laserClass}`}
              >
                <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                  <img
                    src={cls.bannerImage}
                    alt={cls.gameKr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-900/80 to-transparent" />
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3 min-w-0">
                    <img
                      src={cls.mascotImage}
                      alt={cls.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-100 truncate">{cls.name}</h3>
                      <p className={`text-xs sm:text-sm font-medium ${cls.color} truncate`}>{cls.game}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">{cls.description}</p>
                  <span className={`text-xs sm:text-sm font-medium ${cls.linkColor}`}>
                    선생님 보기 →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="page-container pt-0">
        <Link to="/graduation-interview" className="block w-full max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 border border-purple-400/30 rounded-xl p-4 sm:p-6 text-center transition-all duration-300 active:scale-[0.99] sm:hover:scale-[1.01]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-white shrink-0" />
              <h3 className="text-lg sm:text-2xl font-bold text-white truncate">졸업면담지 작성</h3>
            </div>
            <p className="text-purple-200 text-xs sm:text-sm truncate">졸업 면담을 작성해주세요</p>
          </div>
        </Link>
      </div>

      <div className="page-container pt-0 pb-10 sm:pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-800">
            <div className="card-pad">
              <h3 className="heading-section text-gray-200 mb-2 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="truncate">공지사항</span>
              </h3>
              <ul className="text-gray-400 text-xs sm:text-sm space-y-1.5">
                <li className="truncate">• 신입 배정은 선착순입니다</li>
                <li className="truncate">• 정원 마감 시 선택 불가</li>
                <li className="truncate">• 신청 후 확인 1~2일 소요</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
