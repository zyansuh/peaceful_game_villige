import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const classes = [
  {
    id: 'overwatch',
    name: '수달반',
    game: 'Overwatch',
    gameKr: '오버워치',
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500/40',
    hoverBorder: 'hover:border-blue-400',
    bgGlow: 'hover:shadow-blue-500/30',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piy5fmiaagva/class-bg-otter-blue-silhouette.png',
    description: '오버워치와 함께하는 팀워크의 세계',
    accent: 'blue',
  },
  {
    id: 'pubg',
    name: '사자반',
    game: 'PUBG: Battlegrounds',
    gameKr: '배틀그라운드',
    color: 'from-orange-500 to-amber-400',
    borderColor: 'border-orange-500/40',
    hoverBorder: 'hover:border-orange-400',
    bgGlow: 'hover:shadow-orange-500/30',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piy5g2yaagwq/class-bg-lion-orange-silhouette.png',
    description: '배틀그라운드 생존의 법칙을 배우자',
    accent: 'orange',
  },
  {
    id: 'valorant',
    name: '여우반',
    game: 'Valorant',
    gameKr: '발로란트',
    color: 'from-purple-500 to-pink-400',
    borderColor: 'border-purple-500/40',
    hoverBorder: 'hover:border-purple-400',
    bgGlow: 'hover:shadow-purple-500/30',
    bgImage: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piy5jkaaagvq/class-bg-fox-purple-silhouette.png',
    description: '발로란트 전략과 에임의 조화',
    accent: 'purple',
  },
];

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          평화로운게임마을
        </h1>
        <p className="text-xl text-gray-400 mb-2">신입 담당선생님 배정 시스템</p>
        <p className="text-gray-500">원하는 반을 선택하고, 나에게 맞는 선생님을 찾아보세요!</p>
      </div>

      {/* Class Cards - Large background style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {classes.map((cls) => (
          <Link key={cls.id} to={`/class/${cls.id}`} className="block">
            <Card
              className={`relative overflow-hidden border-2 ${cls.borderColor} ${cls.hoverBorder} transition-all duration-500 hover:shadow-2xl ${cls.bgGlow} hover:-translate-y-3 cursor-pointer group h-[320px] md:h-[380px]`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={cls.bgImage}
                  alt={cls.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/30 transition-all duration-500" />
              </div>

              {/* Content overlay */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                {/* Game badge */}
                <div className="mb-auto pt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${cls.color} text-white shadow-lg`}>
                    {cls.gameKr}
                  </span>
                </div>

                {/* Title and description */}
                <div>
                  <div className="overflow-hidden">
                    <h2 className={`text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r ${cls.color} bg-clip-text text-transparent drop-shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out`}>
                      {cls.name}
                    </h2>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 ease-out">{cls.description}</p>
                  <Button
                    className={`w-full bg-gradient-to-r ${cls.color} text-white border-0 hover:opacity-90 shadow-lg transition-all duration-500 delay-200 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100`}
                  >
                    입장하기
                  </Button>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t ${cls.color} mix-blend-overlay`} />
            </Card>
          </Link>
        ))}
      </div>

      {/* Notice */}
      <div className="mt-16 max-w-2xl mx-auto">
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
  );
}