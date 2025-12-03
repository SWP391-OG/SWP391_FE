import { useState } from 'react';
import type { UserRole, Department, Location, Category, Priority } from './types';
import { mockDepartments, mockLocations, mockCategories } from './data/mockData';
import ITStaffPage from './pages/it-staff-page';
import FacilityStaffPage from './pages/facility-staff-page';
import StudentPage from './pages/student-page';

type StaffType = 'it' | 'facility';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [staffType, setStaffType] = useState<StaffType>('it');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'departments' | 'locations'>('categories');
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '📋',
    color: '#3b82f6',
    slaResolveHours: 24,
    defaultPriority: 'medium' as Priority,
    departmentId: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    description: '',
    location: '',
    adminId: '',
    staffIds: [] as string[],
  });
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    description: '',
    type: 'classroom' as 'classroom' | 'wc' | 'hall' | 'corridor' | 'other',
    status: 'active' as 'active' | 'inactive',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold m-0">FPTInsight</h1>
            <p className="text-sm opacity-90 mt-1">Facility Feedback & Helpdesk System</p>
          </div>
          <div className="flex gap-3">
            {/* Student Button */}
            <button
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                currentRole === 'student'
                  ? 'border-white bg-white text-orange-500'
                  : 'border-white/30 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => {
                setCurrentRole('student');
                setShowStaffDropdown(false);
              }}
            >
              Student
            </button>

            {/* Staff Dropdown */}
            <div className="relative">
              <button
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all flex items-center gap-2 ${
                  currentRole === 'staff'
                    ? 'border-white bg-white text-orange-500'
                    : 'border-white/30 bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => {
                  if (currentRole === 'staff') {
                    setShowStaffDropdown(!showStaffDropdown);
                  } else {
                    setCurrentRole('staff');
                    setShowStaffDropdown(true);
                  }
                }}
              >
                Staff {currentRole === 'staff' && `(${staffType === 'it' ? 'IT' : 'Facility'})`}
                <span className={`transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showStaffDropdown && currentRole === 'staff' && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                  <button
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 ${
                      staffType === 'it' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setStaffType('it');
                      setShowStaffDropdown(false);
                    }}
                  >
                    <span className="text-lg">💻</span>
                    IT Staff
                  </button>
                  <button
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 flex items-center gap-3 ${
                      staffType === 'facility' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      setStaffType('facility');
                      setShowStaffDropdown(false);
                    }}
                  >
                    <span className="text-lg">🔧</span>
                    Facility Staff
                  </button>
                </div>
              )}
            </div>

            {/* Admin Button */}
            <button
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                currentRole === 'admin'
                  ? 'border-white bg-white text-orange-500'
                  : 'border-white/30 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => {
                setCurrentRole('admin');
                setShowStaffDropdown(false);
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div>
        {/* Student Page */}
        {currentRole === 'student' && <StudentPage />}

        {/* Staff Pages */}
        {currentRole === 'staff' && (
          <>
            {staffType === 'it' && <ITStaffPage />}
            {staffType === 'facility' && <FacilityStaffPage />}
          </>
        )}

        {/* Admin Page */}
        {currentRole === 'admin' && (
          <>
            <div className="max-w-[1400px] mx-auto p-8">
              <div className="text-center mb-8">
                <span className="inline-block px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  Department Admin
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động
                </p>
              </div>

              {/* Dashboard Layout */}
              <div className="flex gap-8 items-start">
                {/* Sidebar */}
                <div className="w-72 bg-white rounded-xl p-6 shadow-sm sticky top-8">
                  <h3 className="m-0 mb-6 text-lg text-gray-900 font-semibold pb-4 border-b-2 border-gray-100">
                    📊 Quản lý hệ thống
                  </h3>
                  <nav className="flex flex-col gap-2">
                    <button
                      className={`py-3.5 px-4 border-none rounded-lg cursor-pointer text-[0.95rem] text-left transition-all flex items-center gap-3 ${
                        activeTab === 'categories'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold'
                          : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('categories')}
                    >
                      <span className="text-xl">🏷️</span>
                      <span>Quản lý Category</span>
                    </button>
                    <button
                      className={`py-3.5 px-4 border-none rounded-lg cursor-pointer text-[0.95rem] text-left transition-all flex items-center gap-3 ${
                        activeTab === 'departments'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold'
                          : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('departments')}
                    >
                      <span className="text-xl">📋</span>
                      <span>Quản lý Bộ phận</span>
                    </button>
                    <button
                      className={`py-3.5 px-4 border-none rounded-lg cursor-pointer text-[0.95rem] text-left transition-all flex items-center gap-3 ${
                        activeTab === 'locations'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold'
                          : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('locations')}
                    >
                      <span className="text-xl">📍</span>
                      <span>Quản lý Địa điểm</span>
                    </button>
                  </nav>
                  
                  {/* Stats */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="m-0 mb-3 text-sm text-gray-500 font-semibold">
                      📈 Thống kê
                    </h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Categories:</span>
                        <span className="font-semibold text-gray-900">{categories.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Departments:</span>
                        <span className="font-semibold text-gray-900">{departments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Locations:</span>
                        <span className="font-semibold text-gray-900">{locations.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl p-8 shadow-sm">
              {/* Category Management */}
              {activeTab === 'categories' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Category
                    </h3>
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryFormData({
                          name: '',
                          description: '',
                          icon: '📋',
                          color: '#3b82f6',
                          slaResolveHours: 24,
                          defaultPriority: 'medium',
                          departmentId: '',
                          status: 'active',
                        });
                        setIsFormOpen(true);
                      }}
                    >
                      ➕ Thêm Category
                    </button>
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Icon</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Tên Category</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>SLA</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Priority</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Bộ phận</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Trạng thái</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const deptName = departments.find(d => d.id === cat.departmentId)?.name || 'Unknown';
                        const priorityInfo = {
                          low: { bg: '#dbeafe', color: '#1e40af', text: 'Low' },
                          medium: { bg: '#fef3c7', color: '#92400e', text: 'Medium' },
                          high: { bg: '#fed7aa', color: '#9a3412', text: 'High' },
                          urgent: { bg: '#fee2e2', color: '#991b1b', text: 'Urgent' },
                        }[cat.defaultPriority];

                        return (
                          <tr key={cat.id}>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              fontSize: '2rem',
                            }}>{cat.icon}</td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#1f2937',
                              fontWeight: 600,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  background: cat.color,
                                }}></div>
                                {cat.name}
    </div>
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#4b5563',
                            }}>
                              {cat.slaResolveHours < 24 
                                ? `${cat.slaResolveHours} giờ` 
                                : `${Math.floor(cat.slaResolveHours / 24)} ngày`}
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <span style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                background: priorityInfo.bg,
                                color: priorityInfo.color,
                              }}>
                                {priorityInfo.text}
                              </span>
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#4b5563',
                            }}>{deptName}</td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <span style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                background: cat.status === 'active' ? '#d1fae5' : '#fee2e2',
                                color: cat.status === 'active' ? '#065f46' : '#991b1b',
                              }}>
                                {cat.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                  }}
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setCategoryFormData({
                                      name: cat.name,
                                      description: cat.description,
                                      icon: cat.icon,
                                      color: cat.color,
                                      slaResolveHours: cat.slaResolveHours,
                                      defaultPriority: cat.defaultPriority,
                                      departmentId: cat.departmentId,
                                      status: cat.status,
                                    });
                                    setIsFormOpen(true);
                                  }}
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                  }}
                                  onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn xóa category này?')) {
                                      setCategories(categories.filter(c => c.id !== cat.id));
                                    }
                                  }}
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {/* Department Management */}
              {activeTab === 'departments' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Bộ phận
                    </h3>
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setEditingDept(null);
                        setDeptFormData({ name: '', description: '', location: '', adminId: '', staffIds: [] });
                        setIsFormOpen(true);
                      }}
                    >
                      ➕ Thêm Bộ phận
                    </button>
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Tên Bộ phận</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Mô tả</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Vị trí</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Admin ID</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Staff IDs</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id}>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#1f2937',
                            fontWeight: 600,
                          }}>{dept.name}</td>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563',
                          }}>{dept.description}</td>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563',
                          }}>{dept.location}</td>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563',
                          }}>{dept.adminId || '-'}</td>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563',
                          }}>
                            {dept.staffIds && dept.staffIds.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {dept.staffIds.map((id) => (
                                  <span key={id} style={{
                                    padding: '0.25rem 0.5rem',
                                    background: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    color: '#374151',
                                  }}>
                                    {id}
                                  </span>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid #e5e7eb',
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '1.2rem',
                                  cursor: 'pointer',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                }}
                                onClick={() => {
                                  setEditingDept(dept);
                                  setDeptFormData({
                                    name: dept.name,
                                    description: dept.description,
                                    location: dept.location,
                                    adminId: dept.adminId || '',
                                    staffIds: dept.staffIds || [],
                                  });
                                  setIsFormOpen(true);
                                }}
                                title="Chỉnh sửa"
                              >
                                ✏️
                              </button>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  fontSize: '1.2rem',
                                  cursor: 'pointer',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                }}
                                onClick={() => {
                                  if (confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) {
                                    setDepartments(departments.filter(d => d.id !== dept.id));
                                    // Locations không còn liên kết với department
                                  }
                                }}
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Location Management */}
              {activeTab === 'locations' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Địa điểm
                    </h3>
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setEditingLocation(null);
                        setLocationFormData({
                          name: '',
                          description: '',
                          type: 'classroom',
                          status: 'active',
                        });
                        setIsFormOpen(true);
                      }}
                    >
                      ➕ Thêm Địa điểm
                    </button>
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Tên Địa điểm</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Mô tả</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Loại</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Trạng thái</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => {
                        const typeInfo = {
                          classroom: { text: 'Phòng học', icon: '🏫' },
                          wc: { text: 'Nhà vệ sinh', icon: '🚻' },
                          hall: { text: 'Sảnh', icon: '🏛️' },
                          corridor: { text: 'Hành lang', icon: '🚶' },
                          other: { text: 'Khác', icon: '📍' },
                        }[location.type];

                        const statusInfo = {
                          active: { bg: '#d1fae5', color: '#065f46', text: 'Hoạt động' },
                          inactive: { bg: '#fee2e2', color: '#991b1b', text: 'Không hoạt động' },
                        }[location.status];

                        return (
                          <tr key={location.id}>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#1f2937',
                              fontWeight: 600,
                            }}>{location.name}</td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#4b5563',
                            }}>{location.description || '-'}</td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}>
                                <span>{typeInfo.icon}</span>
                                <span>{typeInfo.text}</span>
                              </span>
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <span style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                background: statusInfo.bg,
                                color: statusInfo.color,
                              }}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                            }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                  }}
                                  onClick={() => {
                                    setEditingLocation(location);
                                    setLocationFormData({
                                      name: location.name,
                                      description: location.description || '',
                                      type: location.type,
                                      status: location.status,
                                    });
                                    setIsFormOpen(true);
                                  }}
                                  title="Chỉnh sửa"
                                >
                                  ✏️
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                  }}
                                  onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
                                      setLocations(locations.filter(l => l.id !== location.id));
                                    }
                                  }}
                                  title="Xóa"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
                </div>
              </div>

            {/* Modal Form for Category */}
            {isFormOpen && activeTab === 'categories' && (
              <div
                style={{
                  position: 'fixed',
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
                }}
                onClick={() => setIsFormOpen(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
                      {editingCategory ? 'Chỉnh sửa Category' : 'Thêm Category mới'}
                    </h3>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '0.25rem',
                      }}
                      onClick={() => setIsFormOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    style={{ padding: '1.5rem' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCategory) {
                        setCategories(categories.map(c =>
                          c.id === editingCategory.id ? { ...c, ...categoryFormData } : c
                        ));
                      } else {
                        const newCategory: Category = {
                          ...categoryFormData,
                          id: `cat-${Date.now()}`,
                          createdAt: new Date().toISOString(),
                        };
                        setCategories([...categories, newCategory]);
                      }
                      setIsFormOpen(false);
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '0.9rem',
                        }}>
                          Icon *
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryFormData.icon}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                          placeholder="📋"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1.5rem',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '0.9rem',
                        }}>
                          Màu *
                        </label>
                        <input
                          type="color"
                          required
                          value={categoryFormData.color}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Tên Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        placeholder="VD: Cơ sở vật chất"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Mô tả *
                      </label>
                      <textarea
                        required
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        placeholder="Mô tả về loại phản ánh này"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '0.9rem',
                        }}>
                          SLA (giờ) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={categoryFormData.slaResolveHours}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, slaResolveHours: parseInt(e.target.value) })}
                          placeholder="24"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '0.9rem',
                        }}>
                          Priority mặc định *
                        </label>
                        <select
                          required
                          value={categoryFormData.defaultPriority}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, defaultPriority: e.target.value as Priority })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '1rem',
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Bộ phận phụ trách *
                      </label>
                      <select
                        required
                        value={categoryFormData.departmentId}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, departmentId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="">Chọn bộ phận</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Trạng thái *
                      </label>
                      <select
                        required
                        value={categoryFormData.status}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value as 'active' | 'inactive' })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'flex-end',
                      marginTop: '2rem',
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        style={{
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: '1px solid #d1d5db',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Form for Location */}
            {isFormOpen && activeTab === 'locations' && (
              <div
                style={{
                  position: 'fixed',
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
                }}
                onClick={() => setIsFormOpen(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
                      {editingLocation ? 'Chỉnh sửa Địa điểm' : 'Thêm Địa điểm mới'}
                    </h3>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '0.25rem',
                      }}
                      onClick={() => setIsFormOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    style={{ padding: '1.5rem' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingLocation) {
                        setLocations(locations.map(l =>
                          l.id === editingLocation.id ? { ...l, ...locationFormData } : l
                        ));
                      } else {
                        const newLocation: Location = {
                          ...locationFormData,
                          id: `loc-${Date.now()}`,
                          createdAt: new Date().toISOString(),
                        };
                        setLocations([...locations, newLocation]);
                      }
                      setIsFormOpen(false);
                    }}
                  >
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Tên địa điểm *
                      </label>
                      <input
                        type="text"
                        required
                        value={locationFormData.name}
                        onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                        placeholder="VD: P301, WC Tầng 2"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Mô tả
                      </label>
                      <textarea
                        value={locationFormData.description}
                        onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                        placeholder="Mô tả về địa điểm"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Loại địa điểm *
                      </label>
                      <select
                        required
                        value={locationFormData.type}
                        onChange={(e) => setLocationFormData({ ...locationFormData, type: e.target.value as Location['type'] })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="classroom">🏫 Phòng học</option>
                        <option value="wc">🚻 Nhà vệ sinh</option>
                        <option value="hall">🏛️ Sảnh</option>
                        <option value="corridor">🚶 Hành lang</option>
                        <option value="other">📍 Khác</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Trạng thái *
                      </label>
                      <select
                        required
                        value={locationFormData.status}
                        onChange={(e) => setLocationFormData({ ...locationFormData, status: e.target.value as 'active' | 'inactive' })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'flex-end',
                      marginTop: '2rem',
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        style={{
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: '1px solid #d1d5db',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {editingLocation ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Form for Department */}
            {isFormOpen && activeTab === 'departments' && (
              <div
                style={{
                  position: 'fixed',
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
                }}
                onClick={() => setIsFormOpen(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>
                      {editingDept ? 'Chỉnh sửa Bộ phận' : 'Thêm Bộ phận mới'}
                    </h3>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '0.25rem',
                      }}
                      onClick={() => setIsFormOpen(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    style={{ padding: '1.5rem' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingDept) {
                        setDepartments(departments.map(d =>
                          d.id === editingDept.id ? { ...d, ...deptFormData } : d
                        ));
                      } else {
                        const newDept: Department = {
                          ...deptFormData,
                          id: `dept-${Date.now()}`,
                          createdAt: new Date().toISOString(),
                        };
                        setDepartments([...departments, newDept]);
                      }
                      setIsFormOpen(false);
                    }}
                  >
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Tên bộ phận *
                      </label>
                      <input
                        type="text"
                        required
                        value={deptFormData.name}
                        onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                        placeholder="VD: IT Department"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Mô tả *
                      </label>
                      <textarea
                        required
                        value={deptFormData.description}
                        onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                        placeholder="Mô tả về bộ phận"
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Vị trí *
                      </label>
                      <input
                        type="text"
                        required
                        value={deptFormData.location}
                        onChange={(e) => setDeptFormData({ ...deptFormData, location: e.target.value })}
                        placeholder="VD: Tầng 5, Tòa nhà Alpha"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Admin ID
                      </label>
                      <input
                        type="text"
                        value={deptFormData.adminId}
                        onChange={(e) => setDeptFormData({ ...deptFormData, adminId: e.target.value })}
                        placeholder="VD: admin-001"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: '#374151',
                        fontSize: '0.9rem',
                      }}>
                        Staff IDs (phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={deptFormData.staffIds.join(', ')}
                        onChange={(e) => {
                          const staffIds = e.target.value
                            .split(',')
                            .map(id => id.trim())
                            .filter(id => id.length > 0);
                          setDeptFormData({ ...deptFormData, staffIds });
                        }}
                        placeholder="VD: staff-001, staff-002"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                      {deptFormData.staffIds.length > 0 && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {deptFormData.staffIds.map((id) => (
                            <span key={id} style={{
                              padding: '0.25rem 0.5rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              color: '#374151',
                            }}>
                              {id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'flex-end',
                      marginTop: '2rem',
                    }}>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        style={{
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: '1px solid #d1d5db',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {editingDept ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
