import { useState } from 'react';
import { authService } from '../../services/authService';

interface ForgotPasswordStep2Props {
  email: string;
  onResetSuccess: () => void;
  onBack?: () => void;
  onNavigateToLogin?: () => void;
}

const ForgotPasswordStep2 = ({ 
  email, 
  onResetSuccess, 
  onBack,
  onNavigateToLogin 
}: ForgotPasswordStep2Props) => {
  const [formData, setFormData] = useState({
    resetCode: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.resetCode.trim()) {
      setError('Vui lòng nhập mã reset!');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(
      email,
      formData.resetCode,
      formData.newPassword
    );
    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        onResetSuccess();
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

      {/* Reset Password Form - Centered */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <img 
            src="/logoFPTechnical.jpg" 
            alt="FPTechnical Logo" 
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-sm">{email}</p>
          <div className="text-sm text-gray-400 mt-3">Bước 2/2: Nhập mã reset và mật khẩu mới</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Display (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Reset Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã reset <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="resetCode"
              value={formData.resetCode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Nhập mã reset từ email của bạn"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Kiểm tra email để tìm mã reset
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
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
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        {/* Navigation Buttons */}
        <div className="mt-4 space-y-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              ← Quay lại bước trước
            </button>
          )}
          {onNavigateToLogin && (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordStep2;
