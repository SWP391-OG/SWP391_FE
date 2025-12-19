// Form tạo / chỉnh sửa Địa điểm trong admin
import type { Location } from '../../types';
import type { Campus } from '../../services/campusService';

// Props cho LocationForm
interface LocationFormProps {
  editingLocation: Location | null; // Location đang được chỉnh sửa (null nếu là tạo mới)
  locationFormData: {
    code: string; // Mã địa điểm
    name: string; // Tên địa điểm
    status: 'active' | 'inactive'; // Trạng thái (active: hoạt động, inactive: không hoạt động)
    campusCode?: string; // Mã campus (dùng cho dropdown selection)
    campusId?: number; // ID campus (số nguyên, dùng để gửi API request)
  };
  campuses?: Campus[]; // Danh sách campuses để hiển thị trong dropdown
  onFormDataChange: (data: LocationFormProps['locationFormData']) => void; // Callback khi form data thay đổi
  onSubmit: () => void; // Callback khi submit form
  onClose: () => void; // Callback khi đóng modal
}

// Component modal cho phép admin thêm / sửa một địa điểm
const LocationForm = ({
  editingLocation,
  locationFormData,
  campuses = [],
  onFormDataChange,
  onSubmit,
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
          {/* Dropdown chọn Campus (chỉ hiển thị nếu có danh sách campuses) */}
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
                  // Tìm campus được chọn trong danh sách để lấy campusId
                  const selectedCampus = campuses.find(c => c.campusCode === selectedCampusCode);
                  // Cập nhật form data với campusCode (để hiển thị) và campusId (để gửi API)
                  onFormDataChange({ 
                    ...locationFormData, 
                    campusCode: selectedCampusCode,
                    campusId: selectedCampus?.campusId // Lấy campusId từ campus được chọn
                  });
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">-- Chọn Campus --</option>
                {/* Render danh sách campuses trong dropdown */}
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
