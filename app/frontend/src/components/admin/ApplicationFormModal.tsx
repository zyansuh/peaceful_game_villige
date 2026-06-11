import { useEffect, useState } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';
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
  type AdminApplication,
  type ApplicationFormValues,
  updateApplication,
} from '@/lib/api/applications-admin';

const STATUS_OPTIONS = [
  { value: 'pending', label: '승인대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '거절' },
  { value: 'graduated', label: '졸업' },
  { value: 'cancelled', label: '취소' },
];

const CLASS_OPTIONS = ['수달반', '사자반', '여우반'];

function applicationToForm(app: AdminApplication): ApplicationFormValues {
  return {
    nickname: app.nickname || '',
    discord_id: app.discord_id || '',
    age: app.age || 0,
    game_experience: app.game_experience || '',
    class_name: app.class_name || '',
    status: app.status || 'pending',
    admin_memo: app.admin_memo || '',
  };
}

interface ApplicationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: AdminApplication | null;
  adminEmail: string;
  onSaved: (app: AdminApplication) => void;
}

export default function ApplicationFormModal({
  open,
  onOpenChange,
  application,
  adminEmail,
  onSaved,
}: ApplicationFormModalProps) {
  const [form, setForm] = useState<ApplicationFormValues>(applicationToForm({} as AdminApplication));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !application) return;
    setError(null);
    setSuccess(null);
    setForm(applicationToForm(application));
  }, [open, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    if (!form.nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await updateApplication(application.id, form, adminEmail);
      setSuccess(`「${saved.nickname}」 신청 정보가 저장되었습니다.`);
      onSaved(saved);
      setTimeout(() => onOpenChange(false), 600);
    } catch (err) {
      console.error('Application save failed:', err);
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
            <ClipboardList className="h-5 w-5 text-cyan-400 shrink-0" />
            신청 수정
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs sm:text-sm">
            저장 시 백엔드 DB에 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-gray-300 text-xs sm:text-sm">닉네임 *</Label>
            <Input
              value={form.nickname}
              onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-xs sm:text-sm">디스코드 ID</Label>
            <Input
              value={form.discord_id}
              onChange={(e) => setForm((prev) => ({ ...prev, discord_id: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-xs sm:text-sm">나이</Label>
            <Input
              type="number"
              value={form.age}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, age: parseInt(e.target.value, 10) || 0 }))
              }
              className="bg-gray-800 border-gray-700 text-white h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-xs sm:text-sm">게임 경력</Label>
            <Textarea
              value={form.game_experience}
              onChange={(e) => setForm((prev) => ({ ...prev, game_experience: e.target.value }))}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs sm:text-sm">반</Label>
              <Select
                value={form.class_name}
                onValueChange={(v) => setForm((prev) => ({ ...prev, class_name: v }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 text-xs sm:text-sm">상태</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300 h-9 text-sm">
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

          <div className="space-y-2">
            <Label className="text-gray-300 text-xs sm:text-sm">관리자 메모</Label>
            <Textarea
              value={form.admin_memo}
              onChange={(e) => setForm((prev) => ({ ...prev, admin_memo: e.target.value }))}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white text-sm resize-none"
            />
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
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                '수정 저장'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
