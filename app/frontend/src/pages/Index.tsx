import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const classes = [
  {
    id: 'overwatch',
    name: '수달반',
    game: 'Overwatch',
    gameKr: '오버워치',
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-400',
    bgGlow: 'hover:shadow-blue-500/20',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piwwhpqaagxa/mascot-otter-blue.png',
    description: '오버워치와 함께하는 팀워크의 세계',
  },
  {
    id: 'pubg',
    name: '사자반',
    game: 'PUBG: Battlegrounds',
    gameKr: '배틀그라운드',
    color: 'from-orange-500 to-amber-400',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-400',
    bgGlow: 'hover:shadow-orange-500/20',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piwwd5iaagvq/mascot-lion-orange.png',
    description: '배틀그라운드 생존의 법칙을 배우자',
  },
  {
    id: 'valorant',
    name: '여우반',
    game: 'Valorant',
    gameKr: '발로란트',
    color: 'from-purple-500 to-pink-400',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400',
    bgGlow: 'hover:shadow-purple-500/20',
    image: 'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/piwwdsqaagwa/mascot-fox-redpurple.png',
    description: '발로란트 전략과 에임의 조화',
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

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {classes.map((cls) => (
          <Link key={cls.id} to={`/class/${cls.id}`}>
            <Card className={`bg-gray-900 border ${cls.borderColor} ${cls.hoverBorder} transition-all duration-300 hover:shadow-xl ${cls.bgGlow} hover:-translate-y-2 cursor-pointer group overflow-hidden`}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 mb-4 relative">
                  <img
                    src={cls.image}
                    alt={cls.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h2 className={`text-2xl font-bold mb-1 bg-gradient-to-r ${cls.color} bg-clip-text text-transparent`}>
                  {cls.name}
                </h2>
                <p className="text-gray-400 text-sm mb-2">{cls.gameKr}</p>
                <p className="text-gray-500 text-xs mb-4">{cls.description}</p>
                <Button className={`w-full bg-gradient-to-r ${cls.color} text-white border-0 hover:opacity-90`}>
                  입장하기
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notice */}
      <div className="mt-16 max-w-2xl mx-auto">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">📢 공지사항</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• 신입 배정은 선착순으로 진행됩니다.</li>
              <li>• 정원이 마감된 선생님은 선택할 수 없습니다.</li>
              <li>• 신청 후 관리자 확인까지 1~2일 소요됩니다.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}