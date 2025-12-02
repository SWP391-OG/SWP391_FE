import { useState } from 'react';
import type { Department, Room } from '../types';

interface RoomManagementProps {
  rooms: Room[];
  departments: Department[];
  onAdd: (room: Omit<Room, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, room: Omit<Room, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const RoomManagement = ({ rooms, departments, onAdd, onUpdate, onDelete }: RoomManagementProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    capacity: 0,
    facilities: [] as string[],
    status: 'active' as 'active' | 'maintenance' | 'inactive',
  });
  const [facilityInput, setFacilityInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      departmentId: '',
      capacity: 0,
      facilities: [],
      status: 'active',
    });
    setFacilityInput('');
    setEditingRoom(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      onUpdate(editingRoom.id, formData);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      departmentId: room.departmentId,
      capacity: room.capacity,
      facilities: [...room.facilities],
      status: room.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      onDelete(id);
    }
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()],
      });
      setFacilityInput('');
    }
  };

  const removeFacility = (facility: string) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facility),
    });
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || 'Unknown';
  };

  const getStatusStyle = (status: Room['status']) => {
    const badges = {
      active: { className: 'bg-emerald-100 text-emerald-700', text: 'Hoạt động' },
      maintenance: { className: 'bg-amber-100 text-amber-800', text: 'Bảo trì' },
      inactive: { className: 'bg-red-100 text-red-800', text: 'Không hoạt động' },
    };
    return badges[status];
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-2xl text-gray-800">Danh sách Phòng</h3>
        <button 
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none py-3 px-6 rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsFormOpen(true)}
        >
          ➕ Thêm Phòng
        </button>
      </div>

      {isFormOpen && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
          onClick={resetForm}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="m-0 text-2xl text-gray-800">
                {editingRoom ? 'Chỉnh sửa Phòng' : 'Thêm Phòng mới'}
              </h3>
              <button 
                className="bg-none border-none text-2xl cursor-pointer text-gray-500 p-1 hover:text-gray-700"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Tên phòng *
                </label>
                <input
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Alpha 501"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Bộ phận *
                </label>
                <select
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 cursor-pointer"
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">Chọn bộ phận</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Sức chứa *
                </label>
                <input
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  placeholder="Số người"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Trạng thái *
                </label>
                <select
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 cursor-pointer"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Cơ sở vật chất
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                    type="text"
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                    placeholder="VD: Projector, WiFi..."
                  />
                  <button 
                    type="button" 
                    className="bg-gray-100 text-gray-600 border border-gray-300 py-3 px-6 rounded-lg font-semibold cursor-pointer hover:bg-gray-200 whitespace-nowrap"
                    onClick={addFacility}
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.facilities.map((facility) => (
                    <span 
                      key={facility} 
                      className="inline-flex items-center gap-2 py-2 px-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700"
                    >
                      {facility}
                      <button 
                        type="button" 
                        className="bg-none border-none cursor-pointer text-gray-500 text-base p-0 hover:text-gray-700"
                        onClick={() => removeFacility(facility)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-8">
                <button 
                  type="button" 
                  className="bg-gray-100 text-gray-600 border border-gray-300 py-3 px-6 rounded-lg font-semibold cursor-pointer hover:bg-gray-200"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none py-3 px-6 rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Tên Phòng
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Bộ phận
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Sức chứa
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Cơ sở vật chất
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Trạng thái
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-12 text-gray-400 italic">
                  Chưa có phòng nào. Nhấn "Thêm Phòng" để tạo mới.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const statusBadge = getStatusStyle(room.status);
                return (
                  <tr key={room.id}>
                    <td className="p-4 border-b border-gray-200 text-gray-800 font-semibold">
                      {room.name}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      {getDepartmentName(room.departmentId)}
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      {room.capacity} người
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      <div className="flex flex-wrap gap-2">
                        {room.facilities.map((f) => (
                          <span 
                            key={f} 
                            className="inline-flex items-center gap-2 py-2 px-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      <span className={`inline-block py-2 px-3 rounded-md text-sm font-semibold ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-200 text-gray-600">
                      <div className="flex gap-2">
                        <button
                          className="bg-none border-none text-xl cursor-pointer p-2 rounded-md hover:bg-gray-100"
                          onClick={() => handleEdit(room)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="bg-none border-none text-xl cursor-pointer p-2 rounded-md hover:bg-gray-100"
                          onClick={() => handleDelete(room.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement;
