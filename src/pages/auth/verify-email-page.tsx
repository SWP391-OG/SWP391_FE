import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import ResendVerificationPage from './resend-verification-page';

interface VerifyEmailPageProps {
  email: string;
  onVerifySuccess: () => void;
  onNavigateToLogin?: () => void;
}

type VerifyStep = 'verify' | 'resend';

const VerifyEmailPage = ({ email, onVerifySuccess, onNavigateToLogin }: VerifyEmailPageProps) => {
  const [step, setStep] = useState<VerifyStep>('verify');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(email);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNavigateToLogin?.();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onNavigateToLogin]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError('Vui lòng nhập mã xác thực!');
      return;
    }

    setLoading(true);
    const result = await authService.verifyEmail(currentEmail, verificationCode);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onVerifySuccess();
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  const handleResendSuccess = (resendEmail: string) => {
    setCurrentEmail(resendEmail);
    setVerificationCode('');
    setError('');
    setSuccess('');
    setStep('verify');
  };

  return (
    <>
      {step === 'verify' ? (
        <div className="min-h-screen relative flex items-center justify-center p-4">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/loginFPTechnical.jpg)'
            }}
          >
            {/* Light overlay for better readability while keeping image visible */}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Verify Email Form - Centered */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <img 
                src="/logoFPTechnical.jpg" 
                alt="FPTechnical Logo" 
                className="h-16 w-auto mx-auto mb-4 object-contain"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực Email</h2>
              <p className="text-gray-500 text-sm">Đăng ký thành công!</p>
              <p className="text-gray-500 text-sm">Vui lòng xác thực email của bạn</p>
            </div>

            {/* Email Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Email nhận mã:</p>
              <p className="text-base font-semibold text-blue-800">{currentEmail}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Verification Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã xác thực <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-lg tracking-widest"
                  placeholder="Nhập mã 6 chữ số"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kiểm tra email để lấy mã xác thực (thường ở trong thư spam)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ❌ {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  ✅ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xác thực...' : 'Xác thực Email'}
              </button>
            </form>

            {/* Resend Code Button */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Không nhận được mã?</p>
              <button
                type="button"
                onClick={() => setStep('resend')}
                disabled={loading}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gửi lại mã xác thực
              </button>
            </div>

            {/* Back to Login Link */}
            {onNavigateToLogin && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  ← Quay lại đăng nhập
                </button>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                <strong>💡 Mẹo:</strong> Kiểm tra cả thư Spam/Junk nếu không tìm thấy email xác thực trong Inbox
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ResendVerificationPage
          onResendSuccess={handleResendSuccess}
          onBack={() => setStep('verify')}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </>
  );
};

export default VerifyEmailPage;
