import type { User, UserRole, Department } from '../../types';

interface StaffFormProps {
  editingStaff: User | null;
  staffFormData: {
    username: string;
    password: string;
    fullName: string;
    email: string;
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
          {editingStaff ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Tên đăng nhập *
            </label>
            <input
              type="text"
              required
              value={staffFormData.username}
              onChange={(e) => onFormDataChange({ ...staffFormData, username: e.target.value })}
              placeholder="VD: itstaff01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Mật khẩu *
            </label>
            <input
              type="password"
              required
              value={staffFormData.password}
              onChange={(e) => onFormDataChange({ ...staffFormData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={staffFormData.fullName}
              onChange={(e) => onFormDataChange({ ...staffFormData, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={staffFormData.email}
              onChange={(e) => onFormDataChange({ ...staffFormData, email: e.target.value })}
              placeholder="VD: staff@fpt.edu.vn"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Vai trò *
            </label>
            <select
              required
              value={staffFormData.role}
              onChange={(e) => onFormDataChange({ ...staffFormData, role: e.target.value as UserRole })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            >
              <option value="it-staff">IT Staff</option>
              <option value="facility-staff">Facility Staff</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Bộ phận *
            </label>
            <select
              required
              value={staffFormData.departmentId}
              onChange={(e) => onFormDataChange({ ...staffFormData, departmentId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            >
              <option value="">Chọn bộ phận</option>
              {adminDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          {editingStaff && onResetPassword && onToggleStatus && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1f2937', fontWeight: 600 }}>
                Quản lý tài khoản
              </h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newPassword = prompt('Nhập mật khẩu mới:');
                    if (newPassword && newPassword.trim()) {
                      onResetPassword();
                      alert('Đã cấp lại mật khẩu thành công!');
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    background: 'none',
                    color: '#3b82f6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  Cập nhật mật khẩu
                </button>
                {editingStaff.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn vô hiệu hóa staff này? Staff sẽ không thể đăng nhập nữa.')) {
                        onToggleStatus();
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #dc2626',
                      borderRadius: '8px',
                      background: 'none',
                      color: '#dc2626',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
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
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      background: 'none',
                      color: '#10b981',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#d1fae5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    Mở khóa tài khoản
                  </button>
                )}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
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
