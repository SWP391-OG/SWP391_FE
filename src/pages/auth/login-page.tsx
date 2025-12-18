import { useState } from 'react';
import type { User } from '../../types';
import { authService } from '../../services/authService';
import { saveCurrentUser } from '../../utils/localStorage';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

// ════════════════════════════════════════════════════════════════════════════════════
// 🔐 [LOGIN PAGE] - Trang đăng nhập cho tất cả người dùng
// ════════════════════════════════════════════════════════════════════════════════════
// Chức năng:
// - Xác thực người dùng qua email + password
// - Gọi authService.login() để xác minh thông tin
// - Lưu user vào localStorage sau khi đăng nhập thành công
// - Hỗ trợ chuyển hướng đến trang register/forgot-password
// ════════════════════════════════════════════════════════════════════════════════════

const LoginPage = ({ onLogin, onNavigateToRegister, onNavigateToForgotPassword }: LoginPageProps) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // 🎯 [FORM STATE] - Quản lý trạng thái form đăng nhập
  // ─────────────────────────────────────────────────────────────────────────────────
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────────
  // 📝 [FORM SUBMISSION] - Xử lý gửi form đăng nhập
  // ─────────────────────────────────────────────────────────────────────────────────
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call authService để xác minh email + password
      const user = await authService.login(email, password);
      if (user) {
        // Lưu user vào localStorage với key 'fptech_current_user'
        saveCurrentUser(user);
        // Gọi callback để cập nhật currentUser ở app.tsx
        onLogin(user);
      } else {
        setError('Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
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

      {/* Login Form - Centered */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img 
              src="/logoFPTechnical.jpg" 
              alt="FPTechnical Logo" 
              className="h-16 w-auto mx-auto mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
            <p className="text-gray-500">FPTechnical System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Nhập email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {onNavigateToForgotPassword && (
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Register Link */}
          {onNavigateToRegister && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          )}

          {/* Demo Accounts */}
          
      </div>
    </div>
  );
};

export default LoginPage;

