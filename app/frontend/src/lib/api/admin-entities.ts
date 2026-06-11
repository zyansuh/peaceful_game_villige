type GraduationInterviewUpdate = {
  answer1?: string;
  answer2?: string;
  answer3?: string;
};

export async function adminDeleteGraduationInterview(id: number): Promise<void> {
  const response = await fetch(
    `/api/v1/entities/graduation_interviews/all/${id}`,
    { method: 'DELETE', credentials: 'include' }
  );
  if (!response.ok) {
    throw new Error('졸업면담 삭제에 실패했습니다.');
  }
}

export async function adminUpdateGraduationInterview(
  id: number,
  data: GraduationInterviewUpdate
): Promise<void> {
  const response = await fetch(
    `/api/v1/entities/graduation_interviews/all/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error('졸업면담 수정에 실패했습니다.');
  }
}
