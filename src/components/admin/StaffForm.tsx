import type { User, UserRole, Department } from '../../types';

interface StaffFormProps {
  editingStaff: User | null;
  staffFormData: {
    userCode: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    departmentId: string;
  };
  adminDepartments: Department[];
  onFormDataChange: (data: StaffFormProps['staffFormData']) => void;
  onSubmit: () => void;
  onResetPassword?: () => void;
  onToggleStatus?: () => void;
  onClose: () => void;
}

const StaffForm = ({
  editingStaff,
  staffFormData,
  adminDepartments,
  onFormDataChange,
  onSubmit,
  onResetPassword,
  onToggleStatus,
  onClose,
}: StaffFormProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {editingStaff ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mã nhân viên *
            </label>
            <input
              type="text"
              required
              value={staffFormData.userCode}
              onChange={(e) => onFormDataChange({ ...staffFormData, userCode: e.target.value.toUpperCase() })}
              placeholder="VD: ST001, ST002"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Tên đăng nhập (Email) *
            </label>
            <input
              type="email"
              required
              value={staffFormData.username}
              onChange={(e) => onFormDataChange({ ...staffFormData, username: e.target.value })}
              placeholder="VD: staff@fpt.edu.vn"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mật khẩu 
            </label>
            <input
              type="password"
              value={staffFormData.password}
              onChange={(e) => onFormDataChange({ ...staffFormData, password: e.target.value })}
              placeholder="Nhập mật khẩu (không bắt buộc)"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={staffFormData.fullName}
              onChange={(e) => onFormDataChange({ ...staffFormData, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={staffFormData.phoneNumber || ''}
              onChange={(e) => onFormDataChange({ ...staffFormData, phoneNumber: e.target.value })}
              placeholder="VD: 0912345678"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
         
          {/* <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Vai trò *
            </label>
            <select
              required
              value={staffFormData.role}
              onChange={(e) => onFormDataChange({ ...staffFormData, role: e.target.value as UserRole })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn vai trò</option>
              <option value="it-staff">IT Staff</option>
              <option value="facility-staff">Facility Staff</option>
            </select>
          </div> */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Bộ phận *
            </label>
            <select
              required
              value={staffFormData.departmentId}
              onChange={(e) => onFormDataChange({ ...staffFormData, departmentId: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn bộ phận</option>
              {adminDepartments && adminDepartments.length > 0 ? (
                adminDepartments.map((dept) => {
                  // Department có id là string, cần parse sang number để map với departmentId
                  // Hoặc dùng deptCode nếu có
                  const deptValue = dept.id || dept.deptCode || '';
                  const deptName = dept.deptName || dept.name || '';
                  return (
                    <option key={dept.deptCode || dept.id} value={deptValue}>
                      {deptName}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>Không có bộ phận nào</option>
              )}
            </select>
          </div>
          {editingStaff && onResetPassword && onToggleStatus && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-4">
                Quản lý tài khoản
              </h4>
              <div className="flex gap-4 flex-wrap">
                {/* <button
                  type="button"
                  onClick={() => {
                    const newPassword = prompt('Nhập mật khẩu mới:');
                    if (newPassword && newPassword.trim()) {
                      onResetPassword();
                      alert('Đã cấp lại mật khẩu thành công!');
                    }
                  }}
                  className="px-6 py-3 border border-blue-500 rounded-lg bg-white text-blue-500 font-semibold cursor-pointer hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cập nhật mật khẩu
                </button> */}
                {editingStaff.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn vô hiệu hóa staff này? Staff sẽ không thể đăng nhập nữa.')) {
                        onToggleStatus();
                      }
                    }}
                    className="px-6 py-3 border border-red-600 rounded-lg bg-white text-red-600 font-semibold cursor-pointer hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Khóa tài khoản
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn kích hoạt lại staff này?')) {
                        onToggleStatus();
                      }
                    }}
                    className="px-6 py-3 border border-green-500 rounded-lg bg-white text-green-500 font-semibold cursor-pointer hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Mở khóa tài khoản
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none rounded-lg font-semibold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              {editingStaff ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
