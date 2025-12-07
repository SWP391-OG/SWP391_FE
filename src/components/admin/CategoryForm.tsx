import type { Category, Priority, Department } from '../../types';

interface CategoryFormProps {
  editingCategory: Category | null;
  categoryFormData: {
    code: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    slaResolveHours: number;
    defaultPriority: Priority;
    departmentId: string;
    status: 'active' | 'inactive';
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
              value={categoryFormData.code}
              onChange={(e) => onFormDataChange({ ...categoryFormData, code: e.target.value })}
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
              value={categoryFormData.name}
              onChange={(e) => onFormDataChange({ ...categoryFormData, name: e.target.value })}
              placeholder="VD: Cơ sở vật chất"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mô tả *
            </label>
            <textarea
              required
              value={categoryFormData.description}
              onChange={(e) => onFormDataChange({ ...categoryFormData, description: e.target.value })}
              placeholder="Mô tả về loại phản ánh này"
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base resize-y font-sans focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                SLA (giờ) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={categoryFormData.slaResolveHours}
                onChange={(e) => onFormDataChange({ ...categoryFormData, slaResolveHours: parseInt(e.target.value) })}
                placeholder="24"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Priority mặc định *
              </label>
              <select
                required
                value={categoryFormData.defaultPriority}
                onChange={(e) => onFormDataChange({ ...categoryFormData, defaultPriority: e.target.value as Priority })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Bộ phận phụ trách *
            </label>
            <select
              required
              value={categoryFormData.departmentId}
              onChange={(e) => onFormDataChange({ ...categoryFormData, departmentId: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn bộ phận</option>
              {adminDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Trạng thái *
            </label>
            <select
              required
              value={categoryFormData.status}
              onChange={(e) => onFormDataChange({ ...categoryFormData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
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
