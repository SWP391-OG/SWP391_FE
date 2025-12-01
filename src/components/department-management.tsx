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
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical' as const,
      fontFamily: 'inherit',
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Danh sách Bộ phận</h3>
        <button style={styles.btnPrimary} onClick={() => setIsFormOpen(true)}>
          ➕ Thêm Bộ phận
        </button>
      </div>

      {isFormOpen && (
        <div style={styles.modalOverlay} onClick={resetForm}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.title}>{editingDept ? 'Chỉnh sửa Bộ phận' : 'Thêm Bộ phận mới'}</h3>
              <button style={styles.closeBtn} onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tên bộ phận *</label>
                <input
                  style={styles.input}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: IT Department"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mô tả *</label>
                <textarea
                  style={styles.textarea}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về bộ phận"
                  rows={3}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vị trí *</label>
                <input
                  style={styles.input}
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="VD: Tầng 5, Tòa nhà Alpha"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mã Quản lý</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  placeholder="VD: staff-001"
                />
              </div>
              <div style={styles.formActions}>
                <button type="button" style={styles.btnSecondary} onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  {editingDept ? 'Cập nhật' : 'Thêm mới'}
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
              <th style={styles.th}>Tên Bộ phận</th>
              <th style={styles.th}>Mô tả</th>
              <th style={styles.th}>Vị trí</th>
              <th style={styles.th}>Mã Quản lý</th>
              <th style={styles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyState}>
                  Chưa có bộ phận nào. Nhấn "Thêm Bộ phận" để tạo mới.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id}>
                  <td style={styles.tdBold}>{dept.name}</td>
                  <td style={styles.td}>{dept.description}</td>
                  <td style={styles.td}>{dept.location}</td>
                  <td style={styles.td}>{dept.managerId || '-'}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.btnIcon}
                        onClick={() => handleEdit(dept)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.btnIcon}
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

