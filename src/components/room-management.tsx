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

  const styles = {
    container: { width: '100%' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: { margin: 0, fontSize: '1.5rem', color: '#1f2937' },
    btnPrimary: {
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0.25rem',
    },
    form: { padding: '1.5rem' },
    formGroup: { marginBottom: '1.5rem' },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 600,
      color: '#374151',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
    },
    facilityInput: {
      display: 'flex',
      gap: '0.5rem',
    },
    facilityTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '0.75rem',
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.75rem',
      background: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      color: '#374151',
    },
    tagBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      fontSize: '1rem',
      padding: 0,
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    btnSecondary: {
      background: '#f3f4f6',
      color: '#4b5563',
      border: '1px solid #d1d5db',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
    },
    tableContainer: {
      overflowX: 'auto' as const,
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      background: 'white',
    },
    th: {
      background: '#f9fafb',
      padding: '1rem',
      textAlign: 'left' as const,
      fontWeight: 600,
      color: '#374151',
      borderBottom: '2px solid #e5e7eb',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#4b5563',
    },
    tdBold: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#1f2937',
      fontWeight: 600,
    },
    statusBadge: {
      display: 'inline-block',
      padding: '0.4rem 0.75rem',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    statusActive: {
      background: '#d1fae5',
      color: '#065f46',
    },
    statusMaintenance: {
      background: '#fef3c7',
      color: '#92400e',
    },
    statusInactive: {
      background: '#fee2e2',
      color: '#991b1b',
    },
    actionButtons: { display: 'flex', gap: '0.5rem' },
    btnIcon: {
      background: 'none',
      border: 'none',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '6px',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: '#9ca3af',
      fontStyle: 'italic',
    },
  };

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
      active: { style: styles.statusActive, text: 'Hoạt động' },
      maintenance: { style: styles.statusMaintenance, text: 'Bảo trì' },
      inactive: { style: styles.statusInactive, text: 'Không hoạt động' },
    };
    return badges[status];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Danh sách Phòng</h3>
        <button style={styles.btnPrimary} onClick={() => setIsFormOpen(true)}>
          ➕ Thêm Phòng
        </button>
      </div>

      {isFormOpen && (
        <div style={styles.modalOverlay} onClick={resetForm}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.title}>{editingRoom ? 'Chỉnh sửa Phòng' : 'Thêm Phòng mới'}</h3>
              <button style={styles.closeBtn} onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên phòng *</label>
                <input
                  style={styles.input}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Alpha 501"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bộ phận *</label>
                <select
                  style={styles.select}
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
              <div style={styles.formGroup}>
                <label style={styles.label}>Sức chứa *</label>
                <input
                  style={styles.input}
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  placeholder="Số người"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trạng thái *</label>
                <select
                  style={styles.select}
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cơ sở vật chất</label>
                <div style={styles.facilityInput}>
                  <input
                    style={styles.input}
                    type="text"
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                    placeholder="VD: Projector, WiFi..."
                  />
                  <button type="button" style={styles.btnSecondary} onClick={addFacility}>
                    Thêm
                  </button>
                </div>
                <div style={styles.facilityTags}>
                  {formData.facilities.map((facility) => (
                    <span key={facility} style={styles.tag}>
                      {facility}
                      <button type="button" style={styles.tagBtn} onClick={() => removeFacility(facility)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.btnSecondary} onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tên Phòng</th>
              <th style={styles.th}>Bộ phận</th>
              <th style={styles.th}>Sức chứa</th>
              <th style={styles.th}>Cơ sở vật chất</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.emptyState}>
                  Chưa có phòng nào. Nhấn "Thêm Phòng" để tạo mới.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const statusBadge = getStatusStyle(room.status);
                return (
                  <tr key={room.id}>
                    <td style={styles.tdBold}>{room.name}</td>
                    <td style={styles.td}>{getDepartmentName(room.departmentId)}</td>
                    <td style={styles.td}>{room.capacity} người</td>
                    <td style={styles.td}>
                      <div style={styles.facilityTags}>
                        {room.facilities.map((f) => (
                          <span key={f} style={styles.tag}>{f}</span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, ...statusBadge.style }}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.btnIcon}
                          onClick={() => handleEdit(room)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.btnIcon}
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

