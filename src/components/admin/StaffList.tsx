import type { User, Department } from '../../types';

interface StaffListProps {
  staffUsers: User[];
  departments: Department[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick: (staff: User) => void;
}

const StaffList = ({
  staffUsers,
  departments,
  searchQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  onSearchChange,
  onPageChange,
  onAddClick,
  onEditClick,
}: StaffListProps) => {
  const filteredStaff = staffUsers.filter((staff: User) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const dept = departments.find(d => d.staffIds?.includes(staff.id));
    const deptName = dept?.name || '';
    const roleInfoMap: Record<string, string> = {
      'it-staff': 'IT Staff',
      'facility-staff': 'Facility Staff',
    };
    const roleText = roleInfoMap[staff.role] || staff.role;
    
    return (
      staff.username?.toLowerCase().includes(query) ||
      staff.fullName?.toLowerCase().includes(query) ||
      staff.email?.toLowerCase().includes(query) ||
      roleText.toLowerCase().includes(query) ||
      deptName.toLowerCase().includes(query)
    );
  });
  
  const paginatedFilteredStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          Danh sách Staff
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
          Thêm Staff
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã, tên đăng nhập, họ tên, email, vai trò, bộ phận..."
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
            }}>Mã người dùng</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Họ tên</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Email</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Vai trò</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Bộ phận</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Trạng thái</th>
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
          {filteredStaff.length === 0 ? (
            <tr>
              <td colSpan={7} style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}>
                {searchQuery ? 'Không tìm thấy staff nào phù hợp với từ khóa tìm kiếm' : 'Chưa có staff nào trong departments của bạn'}
              </td>
            </tr>
          ) : (
            paginatedFilteredStaff.map((staff: User) => {
              const dept = departments.find(d => d.staffIds?.includes(staff.id));
              const roleInfoMap: Record<string, { text: string; bg: string; color: string }> = {
                'it-staff': { text: 'IT Staff', bg: '#dbeafe', color: '#1e40af' },
                'facility-staff': { text: 'Facility Staff', bg: '#fef3c7', color: '#92400e' },
              };
              const roleInfo = roleInfoMap[staff.role] || { text: staff.role, bg: '#f3f4f6', color: '#374151' };
              const statusInfoMap: Record<string, { text: string; bg: string; color: string }> = {
                'active': { text: 'Hoạt động', bg: '#d1fae5', color: '#065f46' },
                'inactive': { text: 'Ngừng hoạt động', bg: '#fee2e2', color: '#991b1b' },
                'banned': { text: 'Bị khóa', bg: '#fee2e2', color: '#991b1b' },
              };
              const statusInfo = statusInfoMap[staff.status] || { text: staff.status, bg: '#f3f4f6', color: '#374151' };

              return (
                <tr key={staff.id}>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                    fontWeight: 500,
                  }}>{staff.username}</td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#1f2937',
                    fontWeight: 600,
                  }}>{staff.fullName}</td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}>{staff.email}</td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <span style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: roleInfo.bg,
                      color: roleInfo.color,
                    }}>
                      {roleInfo.text}
                    </span>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                  }}>{dept?.name || '-'}</td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <span style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: statusInfo.bg,
                      color: statusInfo.color,
                    }}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#9ca3af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                      onClick={() => onEditClick(staff)}
                      title="Chỉnh sửa"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ width: '18px', height: '18px' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
        }}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: currentPage === 1 ? '#f3f4f6' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Trước
          </button>
          <span style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            color: '#374151',
          }}>
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: currentPage === totalPages ? '#f3f4f6' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
};

export default StaffList;
