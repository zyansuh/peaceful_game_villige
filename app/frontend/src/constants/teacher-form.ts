export type TeacherFormValues = {
  game_category: string;
  class_name: string;
  nickname: string;
  position: string;
  gender: string;
  birth_year: string;
  mbti: string;
  game_type: string;
  intro: string;
  max_students: number;
  current_students: number;
  status: string;
};

export const CATEGORY_TO_CLASS: Record<string, string> = {
  overwatch: '수달반',
  pubg: '사자반',
  valorant: '여우반',
};

export const GAME_CATEGORY_OPTIONS = [
  { value: 'overwatch', label: '오버워치 (수달반)' },
  { value: 'pubg', label: '배틀그라운드 (사자반)' },
  { value: 'valorant', label: '발로란트 (여우반)' },
] as const;

export const POSITION_OPTIONS = ['선생님', '주임교사', '국장'] as const;

export const STATUS_OPTIONS = [
  { value: 'recruiting', label: '모집중' },
  { value: 'closed', label: '마감' },
  { value: 'resting', label: '휴식중' },
] as const;

export const DEFAULT_TEACHER_FORM: TeacherFormValues = {
  game_category: 'overwatch',
  class_name: '수달반',
  nickname: '',
  position: '선생님',
  gender: '',
  birth_year: '',
  mbti: '',
  game_type: '',
  intro: '',
  max_students: 5,
  current_students: 0,
  status: 'recruiting',
};
