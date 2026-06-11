import client from '@/lib/client';
import {
  buildTeacherPayload,
  type AdminTeacher,
} from '@/utils/teacher/teacher-form';
import type { TeacherFormValues } from '@/constants/teacher-form';
import { CATEGORY_TO_CLASS } from '@/constants/teacher-form';

async function logAdminAction(
  action: 'add' | 'edit' | 'delete',
  teacher: { nickname: string; class_name: string },
  details: string,
  adminEmail: string
) {
  try {
    await client.entities.admin_logs.create({
      data: {
        action,
        target_type: 'teacher',
        target_name: teacher.nickname,
        target_class: teacher.class_name,
        details,
        admin_email: adminEmail,
      },
    });
  } catch (err) {
    console.warn('Admin log failed (teacher saved):', err);
  }
}

export async function createTeacher(
  form: TeacherFormValues,
  adminEmail: string
): Promise<AdminTeacher> {
  const payload = buildTeacherPayload(form);
  const res = await client.entities.teachers.create({ data: payload });
  if (!res?.data) {
    throw new Error('선생님 등록 응답이 없습니다.');
  }
  await logAdminAction(
    'add',
    { nickname: payload.nickname, class_name: payload.class_name },
    '새 선생님 추가',
    adminEmail
  );
  return res.data as AdminTeacher;
}

export async function updateTeacher(
  id: number,
  form: TeacherFormValues,
  adminEmail: string
): Promise<AdminTeacher> {
  const payload = buildTeacherPayload(form);
  const res = await client.entities.teachers.update({
    id: String(id),
    data: payload,
  });
  if (!res?.data) {
    throw new Error('선생님 수정 응답이 없습니다.');
  }
  await logAdminAction(
    'edit',
    { nickname: payload.nickname, class_name: payload.class_name },
    '선생님 정보 수정',
    adminEmail
  );
  return res.data as AdminTeacher;
}

export async function deleteTeacher(
  teacher: AdminTeacher,
  adminEmail: string
): Promise<void> {
  await client.entities.teachers.delete({ id: String(teacher.id) });
  await logAdminAction(
    'delete',
    { nickname: teacher.nickname, class_name: teacher.class_name },
    '선생님 삭제',
    adminEmail
  );
}

export async function updateTeacherStatus(
  id: number,
  status: string,
  teacher?: Pick<AdminTeacher, 'nickname' | 'class_name'>,
  adminEmail?: string
): Promise<void> {
  await client.entities.teachers.update({
    id: String(id),
    data: { status },
  });
  if (teacher && adminEmail) {
    await logAdminAction(
      'edit',
      teacher,
      `선생님 상태 변경: ${status}`,
      adminEmail
    );
  }
}

export function getClassNameFromCategory(gameCategory: string): string {
  return CATEGORY_TO_CLASS[gameCategory] || '수달반';
}
