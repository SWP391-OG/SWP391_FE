import type { Category, Department } from '../../types';

interface CategoryListProps {
  categories: Category[];
  departments: Department[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onEditClick: (category: Category) => void;
}

const CategoryList = ({
  categories,
  departments,
  searchQuery,
  onSearchChange,
  onAddClick,
  onEditClick,
}: CategoryListProps) => {
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesCode = cat.code?.toLowerCase().includes(query);
    const matchesName = cat.name?.toLowerCase().includes(query);
    return matchesCode || matchesName;
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
          Danh sách Category
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ea580c';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f97316';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
          onClick={onAddClick}
        >
          Thêm Category
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '1.5rem',
      }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã category, tên category..."
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
            }}>Mã Category</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>Tên Category</th>
            <th style={{
              background: '#f9fafb',
              padding: '1rem',
              textAlign: 'left',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
            }}>SLA</th>
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
          {filteredCategories.map((cat) => {
            const deptName = departments.find(d => d.id === cat.departmentId)?.name || 'Unknown';

            return (
              <tr key={cat.id}>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#4b5563',
                  fontWeight: 500,
                }}>
                  {cat.code || '-'}
                </td>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#1f2937',
                  fontWeight: 600,
                }}>
                  {cat.name}
                </td>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#4b5563',
                }}>
                  {cat.slaResolveHours < 24 
                    ? `${cat.slaResolveHours} giờ` 
                    : `${Math.floor(cat.slaResolveHours / 24)} ngày`}
                </td>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#4b5563',
                }}>{deptName}</td>
                <td style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <span style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: cat.status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: cat.status === 'active' ? '#065f46' : '#991b1b',
                  }}>
                    {cat.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
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
                    onClick={() => onEditClick(cat)}
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
          })}
        </tbody>
      </table>
    </>
  );
};

export default CategoryList;
