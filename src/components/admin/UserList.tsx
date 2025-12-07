import type { User } from '../../types';

interface UserListProps {
  users: User[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onEditClick: (user: User) => void;
}

const UserList = ({
  users,
  searchQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  onSearchChange,
  onPageChange,
  onEditClick,
}: UserListProps) => {
  const filteredUsers = users.filter((user: User) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });
  
  const paginatedFilteredUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          Danh sách Người dùng
        </h3>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã người dùng, họ tên, email..."
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
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Mã người dùng</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Họ tên</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Email</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Trạng thái</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr key="no-users">
              <td colSpan={5} style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}>
                {searchQuery ? 'Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm' : 'Chưa có người dùng nào'}
              </td>
            </tr>
          ) : (
            paginatedFilteredUsers.map((user: User) => {
              return (
                <tr key={user.id}>
                  <td style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#1f2937',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}>{user.username}</td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#1f2937',
                    fontSize: '0.875rem',
                  }}>{user.fullName}</td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#4b5563',
                    fontSize: '0.875rem',
                  }}>{user.email}</td>
                  <td style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '0.875rem',
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: user.status === 'active' ? '#10b981' : '#ef4444',
                      }}></div>
                      <span style={{
                        color: user.status === 'active' ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}>
                        {user.status === 'active' ? 'Hoạt động' : user.status === 'banned' ? 'Bị khóa' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.875rem 1rem',
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
                      onClick={() => onEditClick(user)}
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

export default UserList;
