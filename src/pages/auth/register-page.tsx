import { useState } from 'react';
// import type { User } from '../../types';
import { authService } from '../../services/authService';
import VerifyEmailPage from './verify-email-page';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin?: () => void;
}

const RegisterPage = ({ onRegisterSuccess, onNavigateToLogin }: RegisterPageProps) => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    studentCode: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ!');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return false;
    }

    if (formData.fullName.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự!');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại!');
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Số điện thoại phải có 10-11 chữ số!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await authService.register(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phoneNumber
    );
    setLoading(false);

    if (result.success) {
      setRegisteredEmail(formData.email);
      setStep('verify');
    } else {
      setError(result.message);
    }
  };

  const handleVerifySuccess = () => {
    // Reset state
    setStep('register');
    setRegisteredEmail('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      studentCode: '',
    });
    // Chuyển về login
    onRegisterSuccess();
  };

  return (
    <>
      {step === 'register' ? (
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

          {/* Register Form - Centered */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="text-center mb-6">
                <img 
                  src="/logoFPTechnical.jpg" 
                  alt="FPTechnical Logo" 
                  className="h-16 w-auto mx-auto mb-4 object-contain"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h2>
                <p className="text-gray-500">FPTechnical System</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Nhập họ và tên"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã người dùng
                  </label>
                  <input
                    type="text"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Mã số sinh viên"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="example@fpt.edu.vn"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="0123456789"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập số điện thoại có 10-11 chữ số
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                      placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                      placeholder="Nhập lại mật khẩu"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    ❌ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              </form>

              {/* Login Link */}
              {onNavigateToLogin && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="text-orange-600 hover:text-orange-700 font-semibold disabled:opacity-50"
                      disabled={loading}
                    >
                      Đăng nhập
                    </button>
                  </p>
                </div>
              )}
          </div>
        </div>
      ) : (
        <VerifyEmailPage 
          email={registeredEmail}
          onVerifySuccess={handleVerifySuccess}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </>
  );
};

export default RegisterPage;

