import type { Category, Priority, Department } from '../../types';

interface CategoryFormProps {
  editingCategory: Category | null;
  categoryFormData: {
    code: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    slaResolveHours: number;
    defaultPriority: Priority;
    departmentId: string;
    status: 'active' | 'inactive';
  };
  adminDepartments: Department[];
  onFormDataChange: (data: CategoryFormProps['categoryFormData']) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const CategoryForm = ({
  editingCategory,
  categoryFormData,
  adminDepartments,
  onFormDataChange,
  onSubmit,
  onDelete,
  onClose,
}: CategoryFormProps) => {
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
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
            {editingCategory ? 'Chỉnh sửa Category' : 'Thêm Category mới'}
          </h3>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form
          style={{ padding: '1.5rem' }}
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
              Mã Category *
            </label>
            <input
              type="text"
              required
              value={categoryFormData.code}
              onChange={(e) => onFormDataChange({ ...categoryFormData, code: e.target.value })}
              placeholder="VD: CAT001, CAT002"
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
              Tên Category *
            </label>
            <input
              type="text"
              required
              value={categoryFormData.name}
              onChange={(e) => onFormDataChange({ ...categoryFormData, name: e.target.value })}
              placeholder="VD: Cơ sở vật chất"
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
              Mô tả *
            </label>
            <textarea
              required
              value={categoryFormData.description}
              onChange={(e) => onFormDataChange({ ...categoryFormData, description: e.target.value })}
              placeholder="Mô tả về loại phản ánh này"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem',
              }}>
                SLA (giờ) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={categoryFormData.slaResolveHours}
                onChange={(e) => onFormDataChange({ ...categoryFormData, slaResolveHours: parseInt(e.target.value) })}
                placeholder="24"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem',
              }}>
                Priority mặc định *
              </label>
              <select
                required
                value={categoryFormData.defaultPriority}
                onChange={(e) => onFormDataChange({ ...categoryFormData, defaultPriority: e.target.value as Priority })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Bộ phận phụ trách *
            </label>
            <select
              required
              value={categoryFormData.departmentId}
              onChange={(e) => onFormDataChange({ ...categoryFormData, departmentId: e.target.value })}
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#374151',
              fontSize: '0.9rem',
            }}>
              Trạng thái *
            </label>
            <select
              required
              value={categoryFormData.status}
              onChange={(e) => onFormDataChange({ ...categoryFormData, status: e.target.value as 'active' | 'inactive' })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f3f4f6',
                color: '#4b5563',
                border: '1px solid #d1d5db',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            {editingCategory && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa category này?')) {
                    onDelete();
                    onClose();
                  }
                }}
                style={{
                  background: 'none',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
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
                Xóa
              </button>
            )}
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
