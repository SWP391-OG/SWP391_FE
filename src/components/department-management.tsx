import { useState } from 'react';
import type { Department } from '../types';

interface DepartmentManagementProps {
  departments: Department[];
  onAdd: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, dept: Omit<Department, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

const DepartmentManagement = ({ departments, onAdd, onUpdate, onDelete }: DepartmentManagementProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    managerId: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', location: '', managerId: '' });
    setEditingDept(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) {
      onUpdate(editingDept.id, formData);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      location: dept.location,
      managerId: dept.managerId || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) {
      onDelete(id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-2xl text-gray-800">Danh sách Bộ phận</h3>
        <button 
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none py-3 px-6 rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsFormOpen(true)}
        >
          ➕ Thêm Bộ phận
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
                {editingDept ? 'Chỉnh sửa Bộ phận' : 'Thêm Bộ phận mới'}
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
                  Tên bộ phận *
                </label>
                <input
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: IT Department"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Mô tả *
                </label>
                <textarea
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base resize-y font-[inherit] focus:outline-none focus:border-blue-500"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về bộ phận"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Vị trí *
                </label>
                <input
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="VD: Tầng 5, Tòa nhà Alpha"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">
                  Mã Quản lý
                </label>
                <input
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500"
                  type="text"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  placeholder="VD: staff-001"
                />
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
                  {editingDept ? 'Cập nhật' : 'Thêm mới'}
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
                Tên Bộ phận
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Mô tả
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Vị trí
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Mã Quản lý
              </th>
              <th className="bg-gray-50 p-4 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-12 text-gray-400 italic">
                  Chưa có bộ phận nào. Nhấn "Thêm Bộ phận" để tạo mới.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id}>
                  <td className="p-4 border-b border-gray-200 text-gray-800 font-semibold">
                    {dept.name}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">
                    {dept.description}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">
                    {dept.location}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">
                    {dept.managerId || '-'}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-600">
                    <div className="flex gap-2">
                      <button
                        className="bg-none border-none text-xl cursor-pointer p-2 rounded-md hover:bg-gray-100"
                        onClick={() => handleEdit(dept)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="bg-none border-none text-xl cursor-pointer p-2 rounded-md hover:bg-gray-100"
                        onClick={() => handleDelete(dept.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentManagement;
