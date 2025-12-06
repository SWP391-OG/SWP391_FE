import { useState } from 'react';
import type { User, UserRole } from '../../types';
import { updateUser } from '../../data/mockUsers';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const ProfileModal = ({ user, onClose, onUpdate }: ProfileModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
  });
  const [error, setError] = useState('');

  const getRoleName = (role: UserRole) => {
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

  const getStatusName = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'banned':
        return 'Bị cấm';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ!');
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

  const handleSave = () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    const result = updateUser(user.id, {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber || undefined,
    });

    if (result.success && result.user) {
      onUpdate(result.user);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } else {
      setError(result.message || 'Cập nhật thất bại!');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
    });
    setError('');
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Thông tin cá nhân</h2>
              <p className="text-orange-100 text-sm">
                {isEditing ? 'Chỉnh sửa hồ sơ' : 'Hồ sơ của bạn'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
            >
              ×
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-4">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Information Fields */}
          <div className="space-y-3">
            {/* Full Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Họ và tên {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <p className="text-gray-800 font-semibold mt-1">{user.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email {isEditing && <span className="text-red-500">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              ) : (
                <p className="text-gray-800 font-semibold mt-1">{user.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="text-gray-800 font-semibold mt-1">
                  {user.phoneNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>

            {/* Role - Read Only */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vai trò
              </label>
              <p className="text-gray-800 font-semibold mt-1">{getRoleName(user.role)}</p>
            </div>

            {/* Username - Read Only */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tên đăng nhập
              </label>
              <p className="text-gray-800 font-semibold mt-1">{user.username}</p>
            </div>

            {/* Status - Read Only */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Trạng thái
              </label>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                  {getStatusName(user.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
              >
                Lưu thay đổi
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
