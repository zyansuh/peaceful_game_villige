import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function SignupComplete() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            회원가입 완료! 🎉
          </h1>
          <p className="text-gray-400 mb-8">
            평화로운게임마을에 가입이 완료되었습니다.<br />
            로그인 후 담당 선생님을 선택해보세요!
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 h-11 font-medium"
            >
              로그인하기
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 h-11"
              >
                메인으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}