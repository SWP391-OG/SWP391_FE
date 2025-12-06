import { useState } from 'react';
import type { User } from '../../types';
import { authenticateUser, mockUsers } from '../../data/mockUsers';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onShowRegister?: () => void;
  onShowForgotPassword?: () => void;
}

const LoginModal = ({ onClose, onLogin, onShowRegister, onShowForgotPassword }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = authenticateUser(username, password);
    if (user) {
      onLogin(user);
      onClose();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'student':
        return 'Sinh viên';
      case 'it-staff':
        return 'IT Staff';
      case 'facility-staff':
        return 'Facility Staff';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full mx-4 shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Login Image */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-50 to-orange-100 p-8 items-center justify-center overflow-hidden">
          <img 
            src="/loginFPTechnical.jpg" 
            alt="FPTechnical Login" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-8">
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
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Nhập tên đăng nhập"
              required
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {onShowForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={onShowForgotPassword}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
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
            className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
          >
            Đăng nhập
          </button>
        </form>

        {/* Register Link */}
        {onShowRegister && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={onShowRegister}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        )}

        {/* Demo Accounts */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">📝 Tài khoản demo:</p>
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setUsername(user.username);
                  setPassword(user.password);
                  setError('');
                }}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-700">{user.username}</span>
                    <span className="text-gray-400 ml-2">({getRoleName(user.role)})</span>
                  </div>
                  <span className="text-gray-400">{user.password}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
