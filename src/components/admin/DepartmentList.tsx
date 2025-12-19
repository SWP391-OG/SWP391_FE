// Danh sách Bộ phận trong trang Admin: hỗ trợ tìm kiếm, filter trạng thái và phân trang
import type { Department } from '../../types';
import Pagination from '../shared/Pagination';

// Props cho component hiển thị danh sách Bộ phận
interface DepartmentListProps {
  departments: Department[];
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (query: string) => void;
  onFilterStatusChange: (status: string) => void;
  onAddClick: () => void;
  onEditClick: (department: Department) => void;
  // Pagination props
  pageNumber?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Component hiển thị bảng Bộ phận + thanh search/filter + phân trang
const DepartmentList = ({
  departments,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterStatusChange,
  onAddClick,
  onEditClick,
  pageNumber = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: DepartmentListProps) => {
  // Lọc danh sách bộ phận theo trạng thái và từ khóa tìm kiếm
  const filteredDepartments = departments.filter((dept) => {
    // Filter theo trạng thái (Hoạt động / Không hoạt động)
    if (filterStatus !== 'all') {
      const deptStatus = dept.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      if (deptStatus !== filterStatus) {
        return false;
      }
    }
    
    // Filter theo từ khóa search (mã hoặc tên bộ phận)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCode = dept.deptCode?.toLowerCase().includes(query);
      const matchesName = dept.deptName?.toLowerCase().includes(query);
      if (!matchesCode && !matchesName) {
        return false;
      }
    }
    return true;
  });

  // Tính toán số trang và cắt dữ liệu cho phân trang client-side
  const totalCount = filteredDepartments.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);
  const hasPrevious = pageNumber > 1;
  const hasNext = pageNumber < totalPages;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Bộ phận
        </h3>
        <button
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={onAddClick}
        >
          Thêm Bộ phận
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hoặc tên bộ phận..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-md text-sm cursor-pointer bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="all">Tất cả</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Không hoạt động</option>
        </select>
      </div>

      {/* Table - Scrollable area */}
      <div className="flex-1 overflow-auto min-h-0 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Mã Bộ phận</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Tên Bộ phận</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Ngày tạo</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDepartments.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">Không tìm thấy bộ phận nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDepartments.map((dept) => (
                <tr key={dept.deptCode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                    {dept.deptCode}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                    {dept.deptName}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-md text-sm font-semibold ${
                      dept.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {dept.createdAt ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(dept.createdAt.includes('Z') ? dept.createdAt : `${dept.createdAt}Z`)) : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      onClick={() => onEditClick(dept)}
                      title="Chỉnh sửa"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      <span className="text-sm">Sửa</span>
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Pagination - Always at bottom */}
      {totalPages > 0 && onPageChange && onPageSizeChange && (
        <div className="mt-auto">
          <Pagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalPages={totalPages}
            totalCount={totalCount}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
