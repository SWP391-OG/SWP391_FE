import type { Department } from '../../types';

interface DepartmentFormProps {
  editingDept: Department | null;
  deptFormData: {
    deptCode: string;
    deptName: string;
    status: 'ACTIVE' | 'INACTIVE';
  };
  onFormDataChange: (data: DepartmentFormProps['deptFormData']) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const DepartmentForm = ({
  editingDept,
  deptFormData,
  onFormDataChange,
  onSubmit,
  onDelete,
  onClose,
}: DepartmentFormProps) => {
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
            {editingDept ? 'Chỉnh sửa Bộ phận' : 'Thêm Bộ phận mới'}
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
              Mã bộ phận *
            </label>
            <input
              type="text"
              required
              value={deptFormData.deptCode}
              onChange={(e) => onFormDataChange({ ...deptFormData, deptCode: e.target.value.toUpperCase() })}
              placeholder="VD: IT, MAINTAIN, FACILITY"
              disabled={!!editingDept}
              className={`w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                editingDept ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {editingDept && (
              <p className="mt-1 text-xs text-gray-500">Mã bộ phận không thể thay đổi khi chỉnh sửa</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Tên bộ phận *
            </label>
            <input
              type="text"
              required
              value={deptFormData.deptName}
              onChange={(e) => onFormDataChange({ ...deptFormData, deptName: e.target.value })}
              placeholder="VD: IT Department, Facilities Management"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Trạng thái *
            </label>
            <select
              required
              value={deptFormData.status}
              onChange={(e) => onFormDataChange({ ...deptFormData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
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
            {editingDept && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) {
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
              {editingDept ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
