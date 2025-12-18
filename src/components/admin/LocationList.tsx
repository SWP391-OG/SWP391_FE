// Danh sách Địa điểm trong trang Admin: tìm kiếm, filter theo Campus / trạng thái và phân trang
import type { Location } from '../../types';
import type { Campus } from '../../services/campusService';
import Pagination from '../shared/Pagination';

// Props cho component hiển thị danh sách Địa điểm
interface LocationListProps {
  locations: Location[];
  loading?: boolean;
  searchQuery: string;
  filterStatus: string;
  filterCampus: string;
  campuses?: Campus[];
  onSearchChange: (query: string) => void;
  onFilterStatusChange: (status: string) => void;
  onFilterCampusChange: (campus: string) => void;
  onAddClick: () => void;
  onEditClick: (location: Location) => void;
  // Pagination props
  pageNumber?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Component hiển thị bảng Địa điểm + thanh search/filter + phân trang
const LocationList = ({
  locations,
  loading = false,
  searchQuery,
  filterStatus,
  filterCampus,
  campuses = [],
  onSearchChange,
  onFilterStatusChange,
  onFilterCampusChange,
  onAddClick,
  onEditClick,
  pageNumber = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: LocationListProps) => {
  // Lọc danh sách địa điểm theo trạng thái, campus và từ khóa tìm kiếm
  const filteredLocations = locations.filter((location) => {
    // Filter theo trạng thái (Hoạt động / Không hoạt động)
    if (filterStatus !== 'all' && location.status !== filterStatus) {
      return false;
    }
    
    // Filter theo campus (theo campusCode hoặc campusId)
    if (filterCampus !== 'all') {
      // Tìm campus đang được chọn trong danh sách campuses từ API
      const selectedCampus = campuses.find(c => 
        c.campusCode === filterCampus || 
        c.campusId?.toString() === filterCampus
      );
      
      if (selectedCampus) {
        // So khớp theo campusCode hoặc campusId
        const matchesCampus = 
          location.campusCode === selectedCampus.campusCode ||
          location.campusId === selectedCampus.campusId;
        if (!matchesCampus) {
          return false;
        }
      } else {
        // Fallback: so khớp trực tiếp nếu không tìm thấy trong mảng campuses
        const matchesCampus = 
          location.campusCode === filterCampus ||
          location.campusId?.toString() === filterCampus;
        if (!matchesCampus) {
          return false;
        }
      }
    }
    
    // Filter theo từ khóa search (mã địa điểm, tên địa điểm, tên campus)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCode = location.code?.toLowerCase().includes(query);
      const matchesName = location.name?.toLowerCase().includes(query);
      // Đồng thời tìm theo tên campus hiển thị cho người dùng
      const campusName = location.campusName 
        || campuses.find(c => 
            c.campusCode === location.campusCode || 
            c.campusId === location.campusId
          )?.campusName
        || '';
      const matchesCampusName = campusName.toLowerCase().includes(query);
      if (!matchesCode && !matchesName && !matchesCampusName) {
        return false;
      }
    }
    return true;
  });

  // Tính toán số trang và cắt dữ liệu cho phân trang client-side
  const totalCount = filteredLocations.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
  const hasPrevious = pageNumber > 1;
  const hasNext = pageNumber < totalPages;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Địa điểm
        </h3>
        <button
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={onAddClick}
        >
          Thêm Địa điểm
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã địa điểm, tên địa điểm, campus..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <select
          value={filterCampus}
          onChange={(e) => onFilterCampusChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-md text-sm cursor-pointer bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="all">Tất cả Campus</option>
          {campuses.map((campus) => (
            <option key={campus.campusCode || campus.campusId} value={campus.campusCode || campus.campusId?.toString() || ''}>
              {campus.campusName || campus.campusCode}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-md text-sm cursor-pointer bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="all">Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Table - Scrollable area */}
      <div className="flex-1 overflow-auto min-h-0 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Mã Địa điểm</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Tên Địa điểm</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Campus</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                  // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : paginatedLocations.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">Không tìm thấy địa điểm nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((location) => {
                  const statusInfo = {
                    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoạt động' },
                    inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Không hoạt động' },
                  }[location.status || 'inactive'];

                  // Ưu tiên campusName từ API response (theo Swagger)
                  // Nếu không có, tìm từ campuses array hoặc dùng campusCode
                  const campusName = location.campusName 
                    || campuses.find(c => 
                        c.campusCode === location.campusCode || 
                        c.campusId === location.campusId
                      )?.campusName
                    || location.campusCode 
                    || '-';

                  return (
                    <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                        {location.code || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                        {location.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {campusName}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-3 py-1.5 rounded-md text-sm font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => onEditClick(location)}
                          disabled={loading}
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
                  );
                })
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

export default LocationList;
