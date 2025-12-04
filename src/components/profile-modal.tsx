import type { User, UserRole } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal = ({ user, onClose }: ProfileModalProps) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl overflow-hidden max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Thông tin cá nhân</h2>
              <p className="text-orange-100 text-sm">Hồ sơ của bạn</p>
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Information Fields */}
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Họ và tên
              </label>
              <p className="text-gray-800 font-semibold mt-1">{user.fullName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </label>
              <p className="text-gray-800 font-semibold mt-1">{user.email}</p>
            </div>

            {user.phoneNumber && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Số điện thoại
                </label>
                <p className="text-gray-800 font-semibold mt-1">{user.phoneNumber}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vai trò
              </label>
              <p className="text-gray-800 font-semibold mt-1">{getRoleName(user.role)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tên đăng nhập
              </label>
              <p className="text-gray-800 font-semibold mt-1">{user.username}</p>
            </div>

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
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

