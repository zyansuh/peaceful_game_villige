import client from '@/lib/client';

export interface AdminApplication {
  id: number;
  nickname: string;
  discord_id: string;
  age: number;
  game_experience: string;
  teacher_id: number;
  class_name: string;
  status: string;
  admin_memo: string;
  created_at: string;
}

export interface ApplicationFormValues {
  nickname: string;
  discord_id: string;
  age: number;
  game_experience: string;
  class_name: string;
  status: string;
  admin_memo: string;
}

async function logAdminAction(
  action: 'edit' | 'delete',
  app: { nickname: string; class_name: string },
  details: string,
  adminEmail: string
) {
  try {
    await client.entities.admin_logs.create({
      data: {
        action,
        target_type: 'application',
        target_name: app.nickname,
        target_class: app.class_name,
        details,
        admin_email: adminEmail,
      },
    });
  } catch (err) {
    console.warn('Admin log failed (application saved):', err);
  }
}

export async function fetchAllApplications(): Promise<AdminApplication[]> {
  const res = await client.entities.applications.queryAll({
    query: {},
    limit: 2000,
    sort: '-created_at',
  });
  const items = res?.data?.items || res?.data || [];
  return Array.isArray(items) ? items : [];
}

export async function updateApplicationStatus(
  appId: number,
  newStatus: string,
  app: Pick<AdminApplication, 'nickname' | 'class_name'>,
  adminEmail: string
): Promise<void> {
  await client.entities.applications.update({
    id: String(appId),
    data: { status: newStatus },
  });
  await logAdminAction(
    'edit',
    app,
    `신청 상태 변경: ${newStatus}`,
    adminEmail
  );
}

export async function updateApplication(
  appId: number,
  data: ApplicationFormValues,
  adminEmail: string
): Promise<AdminApplication> {
  const res = await client.entities.applications.update({
    id: String(appId),
    data,
  });
  if (!res?.data) {
    throw new Error('신청 수정 응답이 없습니다.');
  }
  await logAdminAction(
    'edit',
    { nickname: data.nickname, class_name: data.class_name },
    '신청 정보 수정',
    adminEmail
  );
  return res.data as AdminApplication;
}

export async function deleteApplication(
  app: AdminApplication,
  adminEmail: string
): Promise<void> {
  await client.entities.applications.delete({ id: String(app.id) });
  await logAdminAction(
    'delete',
    { nickname: app.nickname, class_name: app.class_name },
    '신청 삭제',
    adminEmail
  );
}
