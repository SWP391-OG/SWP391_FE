import type { Location } from '../../types';

interface LocationFormProps {
  editingLocation: Location | null;
  locationFormData: {
    code: string;
    name: string;
    description: string;
    type: Location['type'];
    floor: string;
    status: 'active' | 'inactive';
  };
  onFormDataChange: (data: LocationFormProps['locationFormData']) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const LocationForm = ({
  editingLocation,
  locationFormData,
  onFormDataChange,
  onSubmit,
  onDelete,
  onClose,
}: LocationFormProps) => {
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
            {editingLocation ? 'Chỉnh sửa Địa điểm' : 'Thêm Địa điểm mới'}
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
              Mã địa điểm *
            </label>
            <input
              type="text"
              required
              value={locationFormData.code}
              onChange={(e) => onFormDataChange({ ...locationFormData, code: e.target.value })}
              placeholder="VD: LOC001, LOC002"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Tên địa điểm *
            </label>
            <input
              type="text"
              required
              value={locationFormData.name}
              onChange={(e) => onFormDataChange({ ...locationFormData, name: e.target.value })}
              placeholder="VD: P301, WC Tầng 2"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Mô tả
            </label>
            <textarea
              value={locationFormData.description}
              onChange={(e) => onFormDataChange({ ...locationFormData, description: e.target.value })}
              placeholder="Mô tả về địa điểm"
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base resize-y font-sans focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Loại địa điểm *
              </label>
              <select
                required
                value={locationFormData.type}
                onChange={(e) => onFormDataChange({ ...locationFormData, type: e.target.value as Location['type'] })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="classroom">Phòng học</option>
                <option value="wc">Nhà vệ sinh</option>
                <option value="hall">Sảnh</option>
                <option value="corridor">Hành lang</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Tầng
              </label>
              <select
                value={locationFormData.floor}
                onChange={(e) => onFormDataChange({ ...locationFormData, floor: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Chọn tầng</option>
                <option value="G">Tầng Trệt (G)</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
                <option value="4">Tầng 4</option>
                <option value="5">Tầng 5</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">
              Trạng thái *
            </label>
            <select
              required
              value={locationFormData.status}
              onChange={(e) => onFormDataChange({ ...locationFormData, status: e.target.value as 'active' | 'inactive' })}
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
            {editingLocation && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
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
              {editingLocation ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationForm;
