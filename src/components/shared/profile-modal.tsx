import { useState, useEffect } from 'react';
import type { UserProfileDto } from '../../types';
import { userService } from '../../services/userService';

interface ProfileModalProps {
  onClose: () => void;
  onUpdate?: () => void;
  onNavigateHome?: () => void;
}

const ProfileModal = ({ onClose, onUpdate, onNavigateHome }: ProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch profile khi modal mở
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile();
        if (data) {
          setProfile(data);
          setFormData({
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber || '',
          });
        } else {
          setError('Không thể tải thông tin profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Lỗi khi tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
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

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
      });

      if (updated) {
        setProfile(updated);
        setIsEditing(false);
        setSuccess('User profile updated successfully');
        
        // Call onUpdate callback if provided
        if (onUpdate) {
          onUpdate();
        }

        // Auto close modal and navigate home after 1.5 seconds
        setTimeout(() => {
          if (onNavigateHome) {
            onNavigateHome();
          }
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
      });
    }
    setError('');
    setSuccess('');
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
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-500">Đang tải thông tin...</p>
            </div>
          ) : profile ? (
            <>
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  {success}
                </div>
              )}

              {/* Information Fields */}
              <div className="space-y-3">
                {/* User Code - Read Only */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Mã người dùng
                  </label>
                  <p className="text-gray-800 font-semibold mt-1">{profile.userCode}</p>
                </div>

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
                    <p className="text-gray-800 font-semibold mt-1">{profile.fullName}</p>
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
                    <p className="text-gray-800 font-semibold mt-1">{profile.email}</p>
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
                      {profile.phoneNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không thể tải thông tin profile
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && profile && (
          <div className="p-6 pt-0">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Đang lưu...
                    </span>
                  ) : (
                    'Lưu thay đổi'
                  )}
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
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
