import { useState } from 'react';
import type { User } from '../../types';
import { registerUser } from '../../data/mockUsers';

interface RegisterModalProps {
  onClose: () => void;
  onRegisterSuccess: () => void;
}

const RegisterModal = ({ onClose, onRegisterSuccess }: RegisterModalProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ!');
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return false;
    }

    // Validate fullName
    if (formData.fullName.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự!');
      return false;
    }

    // Validate phone number (optional but if provided, must be valid)
    if (formData.phoneNumber) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        setError('Số điện thoại phải có 10-11 chữ số!');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const result = registerUser({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber || undefined,
      userCode: formData.studentCode || undefined, // Map studentCode to userCode
      studentCode: formData.studentCode || undefined, // Backward compatibility
    });

    if (result.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      onRegisterSuccess();
      onClose();
    } else {
      setError(result.message || 'Đăng ký thất bại!');
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
        {/* Left side - Register Image */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-50 to-orange-100 p-8 items-center justify-center overflow-hidden">
          <img 
            src="/loginFPTechnical.jpg" 
            alt="FPTechnical Register" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Right side - Register Form */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-screen">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="0123456789"
              />
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
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
              Đăng ký
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <button
                onClick={() => {
                  onClose();
                  // The parent component will handle showing login modal
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Đăng nhập
              </button>
            </p>
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

export default RegisterModal;
