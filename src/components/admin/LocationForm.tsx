import type { Location } from '../../types';

interface LocationFormProps {
  editingLocation: Location | null;
  locationFormData: {
    code: string;
    name: string;
    description: string;
    type: Location['type'];
    floor: string;
    status: 'active' | 'inactive';
  };
  onFormDataChange: (data: LocationFormProps['locationFormData']) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const LocationForm = ({
  editingLocation,
  locationFormData,
  onFormDataChange,
  onSubmit,
  onClose,
}: LocationFormProps) => {
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
            {editingLocation ? 'Chỉnh sửa Địa điểm' : 'Thêm Địa điểm mới'}
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
              Mã địa điểm *
            </label>
            <input
              type="text"
              required
              value={locationFormData.code}
              onChange={(e) => onFormDataChange({ ...locationFormData, code: e.target.value })}
              placeholder="VD: LOC001, LOC002"
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
              Tên địa điểm *
            </label>
            <input
              type="text"
              required
              value={locationFormData.name}
              onChange={(e) => onFormDataChange({ ...locationFormData, name: e.target.value })}
              placeholder="VD: P301, WC Tầng 2"
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
              Mô tả
            </label>
            <textarea
              value={locationFormData.description}
              onChange={(e) => onFormDataChange({ ...locationFormData, description: e.target.value })}
              placeholder="Mô tả về địa điểm"
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
                Loại địa điểm *
              </label>
              <select
                required
                value={locationFormData.type}
                onChange={(e) => onFormDataChange({ ...locationFormData, type: e.target.value as Location['type'] })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="classroom">Phòng học</option>
                <option value="wc">Nhà vệ sinh</option>
                <option value="hall">Sảnh</option>
                <option value="corridor">Hành lang</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.9rem',
              }}>
                Tầng
              </label>
              <select
                value={locationFormData.floor}
                onChange={(e) => onFormDataChange({ ...locationFormData, floor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="">Chọn tầng</option>
                <option value="G">Tầng Trệt (G)</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
                <option value="4">Tầng 4</option>
                <option value="5">Tầng 5</option>
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
              Trạng thái *
            </label>
            <select
              required
              value={locationFormData.status}
              onChange={(e) => onFormDataChange({ ...locationFormData, status: e.target.value as 'active' | 'inactive' })}
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
              {editingLocation ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;
