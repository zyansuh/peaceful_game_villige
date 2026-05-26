import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function ApplicationComplete() {
  const [searchParams] = useSearchParams();
  const teacherName = searchParams.get('teacher') || '선생님';

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">신청이 완료되었습니다!</h1>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm">담당 선생님</p>
            <p className="text-white text-lg font-semibold">{teacherName}</p>
          </div>
          <p className="text-gray-400 mb-8">
            관리자의 확인 후 안내가 진행됩니다.<br />
            디스코드를 통해 연락드릴 예정입니다.
          </p>
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
              메인으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}