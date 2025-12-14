import type { Location } from '../../types';

import type { Campus } from '../../services/campusService';

interface LocationFormProps {
  editingLocation: Location | null;
  locationFormData: {
    code: string;
    name: string;
    status: 'active' | 'inactive';
    campusCode?: string; // Store campusCode for selection
    campusId?: number; // Store campusId (number) for API request
  };
  campuses?: Campus[];
  onFormDataChange: (data: LocationFormProps['locationFormData']) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const LocationForm = ({
  editingLocation,
  locationFormData,
  campuses = [],
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
          {campuses.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">
                Campus *
              </label>
              <select
                required
                value={locationFormData.campusCode || ''}
                onChange={(e) => {
                  const selectedCampusCode = e.target.value;
                  const selectedCampus = campuses.find(c => c.campusCode === selectedCampusCode);
                  onFormDataChange({ 
                    ...locationFormData, 
                    campusCode: selectedCampusCode,
                    campusId: selectedCampus?.campusId
                  });
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">-- Chọn Campus --</option>
                {campuses.map((campus) => (
                  <option key={campus.campusCode} value={campus.campusCode}>
                    {campus.campusName}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                onClick={async () => {
                  if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
                    try {
                      await onDelete();
                      onClose();
                    } catch (error) {
                      console.error('Error deleting location:', error);
                      // Don't close if error
                    }
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
