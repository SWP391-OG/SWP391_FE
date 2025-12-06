import type { Location } from '../../types';

interface LocationListProps {
  locations: Location[];
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (query: string) => void;
  onFilterStatusChange: (status: string) => void;
  onAddClick: () => void;
  onEditClick: (location: Location) => void;
  onDeleteClick: (locationId: string) => void;
}

const LocationList = ({
  locations,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterStatusChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: LocationListProps) => {
  const filteredLocations = locations.filter((location) => {
    if (filterStatus !== 'all' && location.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCode = location.code?.toLowerCase().includes(query);
      const matchesName = location.name?.toLowerCase().includes(query);
      if (!matchesCode && !matchesName) {
        return false;
      }
    }
    return true;
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
          Danh sách Địa điểm
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
          Thêm Địa điểm
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã địa điểm, tên địa điểm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            padding: '0.625rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            background: 'white',
            minWidth: '150px',
          }}
        >
          <option value="all">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
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
            }}>Mã Địa điểm</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Tên Địa điểm</th>
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
          {filteredLocations.map((location) => {
            const statusInfo = {
              active: { bg: '#d1fae5', color: '#065f46', text: 'Hoạt động' },
              inactive: { bg: '#fee2e2', color: '#991b1b', text: 'Không hoạt động' },
            }[location.status];

            return (
              <tr key={location.id}>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#4b5563',
                  fontWeight: 500,
                }}>{location.code || '-'}</td>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#1f2937',
                  fontWeight: 600,
                }}>{location.name}</td>
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
                      onClick={() => onEditClick(location)}
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
                        if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
                          onDeleteClick(location.id);
                        }
                      }}
                      title="Xóa"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default LocationList;
