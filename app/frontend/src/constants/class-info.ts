export type ClassInfo = {
  name: string;
  gameKr: string;
  color: string;
  gradient: string;
};

export const CLASS_INFO: Record<string, ClassInfo> = {
  overwatch: {
    name: '수달반',
    gameKr: '오버워치',
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-400',
  },
  pubg: {
    name: '사자반',
    gameKr: '배틀그라운드',
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-400',
  },
  valorant: {
    name: '여우반',
    gameKr: '발로란트',
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-400',
  },
};
