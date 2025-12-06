import type { Department } from '../../types';

interface DepartmentListProps {
  departments: Department[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onEditClick: (department: Department) => void;
  onDeleteClick: (departmentId: string) => void;
}

const DepartmentList = ({
  departments,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: DepartmentListProps) => {
  const filteredDepartments = departments.filter((dept) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return dept.name.toLowerCase().includes(query);
  });

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          Danh sách Bộ phận
        </h3>
        <button
          style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '0.625rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
          onClick={onAddClick}
        >
          Thêm Bộ phận
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên bộ phận..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}>
        <thead>
          <tr>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Tên Bộ phận</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Mô tả</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Vị trí</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((dept) => (
            <tr key={dept.id}>
              <td style={{
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                color: '#1f2937',
                fontWeight: 600,
              }}>{dept.name}</td>
              <td style={{
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                color: '#4b5563',
              }}>{dept.description}</td>
              <td style={{
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
                color: '#4b5563',
              }}>{dept.location}</td>
              <td style={{
                padding: '1rem',
                borderBottom: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      color: '#374151',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onClick={() => onEditClick(dept)}
                    title="Chỉnh sửa"
                  >
                    Sửa
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid #dc2626',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      color: '#dc2626',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) {
                        onDeleteClick(dept.id);
                      }
                    }}
                    title="Xóa"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default DepartmentList;
