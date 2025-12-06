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
  onClose: () => void;
}

const StaffForm = ({
  editingStaff,
  staffFormData,
  adminDepartments,
  onFormDataChange,
  onSubmit,
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
