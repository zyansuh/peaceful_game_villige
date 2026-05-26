import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const classes = [
  {
    id: 'overwatch',
    name: '수달반',
    game: 'Overwatch',
    gameKr: '오버워치',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    hoverBorder: 'hover:border-blue-400',
    bgGlow: 'hover:shadow-blue-500/20',
    laserClass: 'laser-border laser-border-blue',
    bannerImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizmjliaagwq/card-overwatch-banner.png',
    mascotImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrrkiaagva/mascot-otter-silhouette.png',
    description: '팀워크와 전략의 정수, 오버워치를 함께 즐겨요!',
    linkColor: 'text-blue-400 hover:text-blue-300',
  },
  {
    id: 'pubg',
    name: '사자반',
    game: 'PUBG',
    gameKr: '배틀그라운드',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    hoverBorder: 'hover:border-orange-400',
    bgGlow: 'hover:shadow-orange-500/20',
    laserClass: 'laser-border laser-border-orange',
    bannerImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizmnraaagvq/card-pubg-banner.png',
    mascotImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrq7aaagwa/mascot-lion-silhouette.png',
    description: '치킨을 향한 여정, 배틀그라운드 마스터!',
    linkColor: 'text-orange-400 hover:text-orange-300',
  },
  {
    id: 'valorant',
    name: '여우반',
    game: 'Valorant',
    gameKr: '발로란트',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    hoverBorder: 'hover:border-purple-400',
    bgGlow: 'hover:shadow-purple-500/20',
    laserClass: 'laser-border laser-border-purple',
    bannerImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-26/piz7ebaaagxa/card-valorant-fox-banner.png',
    mascotImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrs6qaagwq/mascot-fox-silhouette.png',
    description: '정밀한 에임과 전략, 발로란트 에이전트!',
    linkColor: 'text-purple-400 hover:text-purple-300',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 md:py-24">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            평화로운 게임마을
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2">🎮 신입 담당선생님 배정 시스템</p>
          <p className="text-gray-400 max-w-lg mx-auto">
            평겜마에서 적응 할 수 있도록 도와주는 분들이 담당선생님입니다.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            각 반마다 담당 선생님들이 여러분을 기다리고 있습니다.
          </p>
        </div>
      </div>

      {/* Class Selection Section */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-100 mb-10">
          반을 선택하세요
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {classes.map((cls) => (
            <Link key={cls.id} to={`/class/${cls.id}`} className="block group">
              <Card
                className={`overflow-hidden border ${cls.borderColor} ${cls.hoverBorder} transition-all duration-300 hover:shadow-xl ${cls.bgGlow} hover:-translate-y-2 cursor-pointer bg-gray-900/80 ${cls.laserClass}`}
              >
                {/* Banner Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={cls.bannerImage}
                    alt={cls.gameKr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-900/80 to-transparent" />
                </div>

                {/* Info Section */}
                <div className="p-5">
                  {/* Mascot + Class name + Game name */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={cls.mascotImage}
                      alt={cls.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-100">{cls.name}</h3>
                      <p className={`text-sm font-medium ${cls.color}`}>{cls.game}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">{cls.description}</p>

                  {/* Link */}
                  <span className={`text-sm font-medium ${cls.linkColor} transition-colors`}>
                    선생님 보기 →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">📢 공지사항</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 신입 배정은 선착순으로 진행됩니다.</li>
                <li>• 정원이 마감된 선생님은 선택할 수 없습니다.</li>
                <li>• 신청 후 관리자 확인까지 1~2일 소요됩니다.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}