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
    const matchesCode = cat.categoryCode?.toLowerCase().includes(query);
    const matchesName = cat.categoryName?.toLowerCase().includes(query);
    return matchesCode || matchesName;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Category
        </h3>
        <button
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={onAddClick}
        >
          Thêm Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã category, tên category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Mã Category</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Tên Category</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">SLA</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Bộ phận</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((cat) => {
                // Tìm department theo departmentId (có thể là number hoặc string)
                const department = departments.find(d => {
                  const dId = typeof d.id === 'number' ? d.id : parseInt(String(d.id), 10);
                  const catDeptId = typeof cat.departmentId === 'number' ? cat.departmentId : parseInt(String(cat.departmentId), 10);
                  return dId === catDeptId;
                });
                
                // Lấy tên bộ phận: ưu tiên deptName, sau đó name, cuối cùng fallback
                const deptName = department?.deptName || department?.name || (cat.departmentId ? `Bộ phận ID: ${cat.departmentId}` : '-');

                return (
                  <tr key={cat.categoryCode} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                      {cat.categoryCode || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                      {cat.categoryName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {cat.slaResolveHours < 24 
                        ? `${cat.slaResolveHours} giờ` 
                        : `${Math.floor(cat.slaResolveHours / 24)} ngày`}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {deptName}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-md text-sm font-semibold ${
                        cat.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cat.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        onClick={() => onEditClick(cat)}
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CategoryList;
