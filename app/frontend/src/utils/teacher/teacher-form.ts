import {
  CATEGORY_TO_CLASS,
  DEFAULT_TEACHER_FORM,
  type TeacherFormValues,
} from '@/constants/teacher-form';

export type AdminTeacher = {
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
  max_students: number;
  current_students: number;
  status: string;
};

export function parseDetailIntro(detailIntro: string): {
  gender: string;
  birthYear: string;
} {
  let gender = '';
  let birthYear = '';
  if (detailIntro) {
    const genderMatch = detailIntro.match(/성별:\s*([^\s|]+)/);
    const birthMatch = detailIntro.match(/출생년도:\s*([^\s|]+)/);
    if (genderMatch) gender = genderMatch[1];
    if (birthMatch) birthYear = birthMatch[1].replace('년생', '');
  }
  return { gender, birthYear };
}

export function buildTeacherPayload(form: TeacherFormValues) {
  const detailIntro = `성별: ${form.gender || '-'} | 출생년도: ${form.birth_year || '-'}년생`;
  return {
    game_category: form.game_category,
    class_name: CATEGORY_TO_CLASS[form.game_category] || form.class_name || '수달반',
    nickname: form.nickname.trim(),
    position: form.position,
    detail_intro: detailIntro,
    personality: form.mbti,
    teaching_style: form.game_type,
    intro: form.intro,
    message: form.intro,
    max_students: Number(form.max_students),
    current_students: Number(form.current_students),
    status: form.status,
    tier: '',
    active_time: '',
    profile_image: '',
  };
}

export function teacherToForm(teacher: AdminTeacher): TeacherFormValues {
  const { gender, birthYear } = parseDetailIntro(teacher.detail_intro);
  return {
    game_category: teacher.game_category,
    class_name: teacher.class_name,
    nickname: teacher.nickname,
    position: teacher.position || '선생님',
    gender,
    birth_year: birthYear,
    mbti: teacher.personality || '',
    game_type: teacher.teaching_style || '',
    intro: teacher.intro || '',
    max_students: teacher.max_students,
    current_students: teacher.current_students,
    status: teacher.status,
  };
}

export function getEmptyTeacherForm(): TeacherFormValues {
  return { ...DEFAULT_TEACHER_FORM };
}

export function validateTeacherForm(form: TeacherFormValues): string | null {
  if (!form.nickname.trim()) return '닉네임을 입력해주세요.';
  if (form.max_students < 1) return '최대 인원은 1명 이상이어야 합니다.';
  if (form.current_students < 0) return '현재 인원은 0 이상이어야 합니다.';
  if (form.current_students > form.max_students) {
    return '현재 인원이 최대 인원을 초과할 수 없습니다.';
  }
  return null;
}
