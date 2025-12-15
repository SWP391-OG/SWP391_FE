import type { Category, Priority, Department } from '../../types';

interface CategoryFormProps {
  editingCategory: Category | null;
  categoryFormData: {
    categoryCode: string;
    categoryName: string;
    departmentId: number;
    slaResolveHours: number;
    status: 'ACTIVE' | 'INACTIVE';
    // Frontend-only fields (not sent to API)
    icon?: string;
    color?: string;
    defaultPriority?: Priority;
  };
  adminDepartments: Department[];
  onFormDataChange: (data: CategoryFormProps['categoryFormData']) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const CategoryForm = ({
  editingCategory,
  categoryFormData,
  adminDepartments,
  onFormDataChange,
  onSubmit,
  onDelete,
  onClose,
}: CategoryFormProps) => {
  // Debug: Log departments để kiểm tra
  console.log('📋 CategoryForm - adminDepartments:', {
    count: adminDepartments?.length || 0,
    departments: adminDepartments?.map(d => ({
      deptCode: d.deptCode,
      deptName: d.deptName,
      id: d.id,
      name: d.name
    }))
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {editingCategory ? 'Chỉnh sửa Category' : 'Thêm Category mới'}
          </h3>
          <button
            className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-1 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mã Category *
            </label>
            <input
              type="text"
              required
              value={categoryFormData.categoryCode}
              onChange={(e) => onFormDataChange({ ...categoryFormData, categoryCode: e.target.value.toUpperCase() })}
              placeholder="VD: CAT001, CAT002"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Tên Category *
            </label>
            <input
              type="text"
              required
              value={categoryFormData.categoryName}
              onChange={(e) => onFormDataChange({ ...categoryFormData, categoryName: e.target.value })}
              placeholder="VD: Cơ sở vật chất"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              SLA (giờ) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={categoryFormData.slaResolveHours}
              onChange={(e) => onFormDataChange({ ...categoryFormData, slaResolveHours: parseInt(e.target.value) || 24 })}
              placeholder="24"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Bộ phận phụ trách *
            </label>
            <select
              required
              value={categoryFormData.departmentId || ''}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                if (!isNaN(selectedId)) {
                  onFormDataChange({ ...categoryFormData, departmentId: selectedId });
                }
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn bộ phận</option>
              {adminDepartments && adminDepartments.length > 0 ? (
                adminDepartments.map((dept, index) => {
                  // CategoryList so sánh: cat.departmentId?.toString() === d.id
                  // Vậy Department.id là string representation của departmentId (number)
                  // Cần parse Department.id (string) sang number để dùng làm Category.departmentId
                  let deptId = 0;
                  
                  // Thử parse từ id (string) sang number
                  if (dept.id) {
                    const parsed = parseInt(String(dept.id), 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      deptId = parsed;
                    }
                  }
                  
                  // Nếu không parse được từ id, thử parse từ deptCode nếu có pattern số
                  if (deptId === 0 && dept.deptCode) {
                    // Thử extract số từ deptCode (ví dụ: "IT" -> không có số, "DEPT1" -> 1)
                    const match = dept.deptCode.match(/\d+/);
                    if (match) {
                      const parsed = parseInt(match[0], 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        deptId = parsed;
                      }
                    }
                  }
                  
                  // Nếu vẫn không parse được, dùng index + 1 (tạm thời - không lý tưởng)
                  if (deptId === 0) {
                    deptId = index + 1;
                    console.warn(`⚠️ Cannot parse departmentId for ${dept.deptCode || dept.id}, using index ${deptId}`);
                  }
                  
                  const deptName = dept.deptName || dept.name || `Department ${index + 1}`;
                  const deptKey = dept.deptCode || dept.id || `dept-${index}`;
                  
                  return (
                    <option key={deptKey} value={deptId}>
                      {deptName}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>Không có bộ phận nào</option>
              )}
            </select>
            {adminDepartments && adminDepartments.length === 0 && (
              <p className="mt-1 text-xs text-yellow-600">⚠️ Chưa có bộ phận nào. Vui lòng tạo bộ phận trước.</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Trạng thái *
            </label>
            <select
              required
              value={categoryFormData.status}
              onChange={(e) => onFormDataChange({ ...categoryFormData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>
          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Hủy
            </button>
            {editingCategory && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa category này?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="px-6 py-3 bg-white text-red-600 border border-red-600 rounded-lg font-semibold cursor-pointer hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Xóa
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none rounded-lg font-semibold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
