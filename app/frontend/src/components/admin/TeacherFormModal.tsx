import { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CATEGORY_TO_CLASS,
  DEFAULT_TEACHER_FORM,
  GAME_CATEGORY_OPTIONS,
  POSITION_OPTIONS,
  STATUS_OPTIONS,
  type TeacherFormValues,
} from '@/constants/teacher-form';
import {
  type AdminTeacher,
  getEmptyTeacherForm,
  teacherToForm,
  validateTeacherForm,
} from '@/utils/teacher/teacher-form';
import { createTeacher, updateTeacher } from '@/lib/api/teachers-admin';

interface TeacherFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeacher?: AdminTeacher | null;
  adminEmail: string;
  onSaved: (teacher: AdminTeacher, mode: 'create' | 'update') => void;
}

export default function TeacherFormModal({
  open,
  onOpenChange,
  editingTeacher,
  adminEmail,
  onSaved,
}: TeacherFormModalProps) {
  const isEdit = !!editingTeacher;
  const [form, setForm] = useState<TeacherFormValues>(DEFAULT_TEACHER_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);
    setForm(editingTeacher ? teacherToForm(editingTeacher) : getEmptyTeacherForm());
  }, [open, editingTeacher]);

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      game_category: value,
      class_name: CATEGORY_TO_CLASS[value] || prev.class_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateTeacherForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editingTeacher) {
        const saved = await updateTeacher(editingTeacher.id, form, adminEmail);
        setSuccess(`「${saved.nickname}」 선생님 정보가 저장되었습니다.`);
        onSaved(saved, 'update');
      } else {
        const saved = await createTeacher(form, adminEmail);
        setSuccess(`「${saved.nickname}」 선생님이 등록되었습니다.`);
        onSaved(saved, 'create');
        setForm(getEmptyTeacherForm());
      }

      setTimeout(() => {
        onOpenChange(false);
      }, 600);
    } catch (err) {
      console.error('Teacher save failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : '저장에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <UserPlus className="h-5 w-5 text-blue-400 shrink-0" />
            {isEdit ? '선생님 수정' : '선생님 등록'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs sm:text-sm">
            저장 시 백엔드 DB에 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-gray-300 text-xs sm:text-sm">게임 / 반</Label>
            <Select value={form.game_category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {GAME_CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">닉네임 *</Label>
              <Input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                required
                placeholder="닉네임"
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">직책</Label>
              <Select
                value={form.position}
                onValueChange={(v) => setForm({ ...form, position: v })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {POSITION_OPTIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">성별</Label>
              <Input
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                placeholder="남 / 여"
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">출생년도</Label>
              <Input
                value={form.birth_year}
                onChange={(e) => setForm({ ...form, birth_year: e.target.value })}
                placeholder="99"
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">MBTI</Label>
              <Input
                value={form.mbti}
                onChange={(e) => setForm({ ...form, mbti: e.target.value })}
                placeholder="ENFP"
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">게임유형</Label>
              <Input
                value={form.game_type}
                onChange={(e) => setForm({ ...form, game_type: e.target.value })}
                placeholder="빠대/경쟁"
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 text-xs sm:text-sm">소개</Label>
            <Textarea
              value={form.intro}
              onChange={(e) => setForm({ ...form, intro: e.target.value })}
              rows={3}
              placeholder="선생님 소개"
              className="bg-gray-800 border-gray-700 text-white mt-1 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">최대 인원</Label>
              <Input
                type="number"
                min={1}
                value={form.max_students}
                onChange={(e) =>
                  setForm({ ...form, max_students: parseInt(e.target.value, 10) || 0 })
                }
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">현재 인원</Label>
              <Input
                type="number"
                min={0}
                value={form.current_students}
                onChange={(e) =>
                  setForm({ ...form, current_students: parseInt(e.target.value, 10) || 0 })
                }
                className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs sm:text-sm">상태</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-xs sm:text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : isEdit ? (
                '수정 저장'
              ) : (
                '등록 저장'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
