export type GameClassCard = {
  id: string;
  name: string;
  game: string;
  gameKr: string;
  color: string;
  borderColor: string;
  hoverBorder: string;
  bgGlow: string;
  laserClass: string;
  bannerImage: string;
  mascotImage: string;
  description: string;
  linkColor: string;
};

export const GAME_CLASSES: GameClassCard[] = [
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
    bannerImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-26/pi56urqaagva/card-overwatch-reinhardt-banner.png',
    mascotImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrrkiaagva/mascot-otter-silhouette.png',
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
    bannerImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizmnraaagvq/card-pubg-banner.png',
    mascotImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrq7aaagwa/mascot-lion-silhouette.png',
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
    bannerImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-26/piz7ebaaagxa/card-valorant-fox-banner.png',
    mascotImage:
      'https://mgx-backend-cdn.metadl.com/generate/images/1277232/2026-05-25/pizrs6qaagwq/mascot-fox-silhouette.png',
    description: '정밀한 에임과 전략, 발로란트 에이전트!',
    linkColor: 'text-purple-400 hover:text-purple-300',
  },
];
