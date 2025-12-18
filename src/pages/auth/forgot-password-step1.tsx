// Bước 1 - Quên mật khẩu: nhập email và yêu cầu gửi mã reset về email
import { useState } from 'react';
import { authService } from '../../services/authService';

interface ForgotPasswordStep1Props {
  onNext: (email: string) => void;
  onNavigateToLogin?: () => void;
}

const ForgotPasswordStep1 = ({ onNext, onNavigateToLogin }: ForgotPasswordStep1Props) => {
  // State quản lý input email + thông báo lỗi / thành công
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Kiểm tra định dạng email cơ bản trước khi gọi API
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ!');
      return false;
    }
    return true;
  };

  // Gửi request quên mật khẩu lên backend, nếu thành công thì chuyển sang bước 2
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      // Chuyển đến bước 2 sau 2 giây
      setTimeout(() => {
        onNext(email);
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
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

      {/* Forgot Password Form - Centered */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src="/logoFPTechnical.jpg" 
            alt="FPTechnical Logo" 
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu</h2>
          <p className="text-gray-500">Đặt lại mật khẩu của bạn</p>
          <div className="text-sm text-gray-400 mt-3">Bước 1/2: Nhập email của bạn</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Nhập email của bạn"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu
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
            {loading ? 'Đang gửi...' : 'Gửi mã reset'}
          </button>
        </form>

        {/* Back to Login Link */}
        {onNavigateToLogin && (
          <div className="mt-4 text-center">
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
      </div>
    </div>
  );
};

export default ForgotPasswordStep1;
