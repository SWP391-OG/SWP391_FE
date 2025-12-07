import type { Department } from '../../types';

interface DepartmentFormProps {
  editingDept: Department | null;
  deptFormData: {
    name: string;
    description: string;
    location: string;
    adminId: string;
    staffIds: string[];
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
              Tên bộ phận *
            </label>
            <input
              type="text"
              required
              value={deptFormData.name}
              onChange={(e) => onFormDataChange({ ...deptFormData, name: e.target.value })}
              placeholder="VD: IT Department"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mô tả *
            </label>
            <textarea
              required
              value={deptFormData.description}
              onChange={(e) => onFormDataChange({ ...deptFormData, description: e.target.value })}
              placeholder="Mô tả về bộ phận"
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base resize-y font-sans focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Vị trí *
            </label>
            <input
              type="text"
              required
              value={deptFormData.location}
              onChange={(e) => onFormDataChange({ ...deptFormData, location: e.target.value })}
              placeholder="VD: Tầng 5, Tòa nhà Alpha"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
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
