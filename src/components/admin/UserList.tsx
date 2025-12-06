import type { User } from '../../types';

interface UserListProps {
  users: User[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onViewHistory: (user: User) => void;
  onToggleBan: (user: User) => void;
}

const UserList = ({
  users,
  searchQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  onSearchChange,
  onPageChange,
  onViewHistory,
  onToggleBan,
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
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        style={{
                          background: 'none',
                          border: '1px solid #3b82f6',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: '#3b82f6',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                        }}
                        onClick={() => onViewHistory(user)}
                        title="Xem lịch sử ticket"
                      >
                        Lịch sử
                      </button>
                      {user.status === 'active' ? (
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
                          onClick={() => onToggleBan(user)}
                          title="Khóa tài khoản (Ban)"
                        >
                          Khóa
                        </button>
                      ) : user.status === 'banned' ? (
                        <button
                          style={{
                            background: 'none',
                            border: '1px solid #10b981',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#d1fae5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                          }}
                          onClick={() => onToggleBan(user)}
                          title="Mở khóa (Unban)"
                        >
                          Mở khóa
                        </button>
                      ) : null}
                    </div>
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
