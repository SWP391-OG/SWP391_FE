import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, Department, Location, Category, Priority, Ticket } from '../../types';
import { useTickets } from '../../hooks/useTickets';
import { useCategories } from '../../hooks/useCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useLocations } from '../../hooks/useLocations';
import { useUsers } from '../../hooks/useUsers';
import TicketDetailModal from '../../components/shared/ticket-detail-modal';
import TicketReviewModal from '../../components/admin/TicketReviewModal';
import CategoryForm from '../../components/admin/CategoryForm';
import CategoryList from '../../components/admin/CategoryList';
import DepartmentForm from '../../components/admin/DepartmentForm';
import DepartmentList from '../../components/admin/DepartmentList';
import LocationForm from '../../components/admin/LocationForm';
import LocationList from '../../components/admin/LocationList';
import StaffForm from '../../components/admin/StaffForm';
import StaffList from '../../components/admin/StaffList';
import UserForm from '../../components/admin/UserForm';
import UserList from '../../components/admin/UserList';
import TicketsTable from '../../components/admin/TicketsTable';
import ReportsPage from '../../components/admin/ReportsPage';

type AdminTab = 'categories' | 'departments' | 'locations' | 'tickets' | 'staff' | 'users' | 'reports';

interface AdminPageProps {
  currentAdminId?: string;
}

const AdminPage = ({ currentAdminId = 'admin-001' }: AdminPageProps) => {
  // Hooks
  const { tickets, assignTicket, updateTicketPriority, cancelTicket, updateTicketStatus, getTicketsByUserId } = useTickets();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { departments, createDepartment, updateDepartment, deleteDepartment, loadDepartments } = useDepartments();
  const { locations, createLocation, updateLocation, deleteLocation } = useLocations();
  const { users, createUser, updateUser } = useUsers();

  // UI State
  const [activeTab, setActiveTab] = useState<AdminTab>('tickets');
  const [showMembersSubmenu, setShowMembersSubmenu] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketForReview, setSelectedTicketForReview] = useState<Ticket | null>(null);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);

  // Form state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form data
  const [categoryFormData, setCategoryFormData] = useState({
    code: '',
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
    adminId: currentAdminId,
    staffIds: [] as string[],
  });

  const [locationFormData, setLocationFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'classroom' as 'classroom' | 'wc' | 'hall' | 'corridor' | 'other',
    floor: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [staffFormData, setStaffFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'it-staff' as UserRole,
    departmentId: '',
  });

  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'student' as UserRole,
  });

  // Search and filter state
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationFilterStatus, setLocationFilterStatus] = useState<string>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const itemsPerPage = 10;

  // Auto-open submenu
  useEffect(() => {
    if (activeTab === 'staff' || activeTab === 'users') {
      setShowMembersSubmenu(true);
    }
  }, [activeTab]);

  // Filter departments by adminId
  const adminDepartments = useMemo(() => {
    return departments.filter(dept => dept.adminId === currentAdminId);
  }, [departments, currentAdminId]);

  const adminDepartmentIds = useMemo(() => {
    return adminDepartments.map(dept => dept.id);
  }, [adminDepartments]);

  // Filter categories by admin's departments
  const adminCategories = useMemo(() => {
    return categories.filter(cat => adminDepartmentIds.includes(cat.departmentId));
  }, [categories, adminDepartmentIds]);

  // Map IssueCategory to Category name for ticket filtering
  const categoryNameMap: Record<string, string[]> = {
    'wifi': ['WiFi/Mạng'],
    'equipment': ['Thiết bị'],
    'facility': ['Cơ sở vật chất', 'Điện nước', 'Khẩn cấp'],
    'classroom': ['Vệ sinh'],
    'other': ['Cơ sở vật chất', 'Vệ sinh'],
  };

  // Filter tickets by admin's departments
  const adminTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (ticket.status === 'cancelled') return false;
      
      const matchingCategoryNames = categoryNameMap[ticket.category] || [];
      const matchingCategories = categories.filter(cat => 
        matchingCategoryNames.includes(cat.name)
      );
      
      return matchingCategories.some(cat => 
        adminDepartmentIds.includes(cat.departmentId)
      );
    });
  }, [tickets, categories, adminDepartmentIds]);

  // Get staff list for admin's departments
  const adminStaffList = useMemo(() => {
    const staffMap = new Map<string, { id: string; name: string; departmentName: string }>();
    adminDepartments.forEach(dept => {
      dept.staffIds.forEach(staffId => {
        if (!staffMap.has(staffId)) {
          // Try to find staff in users array first (for dynamically created staff)
          const staffUser = users.find(u => u.id === staffId && (u.role === 'it-staff' || u.role === 'facility-staff'));
          
          // Fallback to hardcoded names for old staff IDs
          const staffNames: Record<string, string> = {
            'staff-001': 'Lý Văn K',
            'staff-002': 'Bùi Thị H',
            'staff-003': 'Hoàng Văn E',
            'staff-004': 'Ngô Văn M',
            'staff-005': 'Trần Văn B',
          };
          
          staffMap.set(staffId, {
            id: staffId,
            name: staffUser?.fullName || staffNames[staffId] || staffId,
            departmentName: dept.name,
          });
        }
      });
    });
    
    // Also include staff users from admin's departments that might not be in dept.staffIds yet
    const adminStaffUsers = users.filter(user => 
      (user.role === 'it-staff' || user.role === 'facility-staff') &&
      user.departmentId &&
      adminDepartments.some(dept => dept.id === user.departmentId)
    );
    
    adminStaffUsers.forEach(user => {
      if (!staffMap.has(user.id)) {
        const dept = adminDepartments.find(d => d.id === user.departmentId);
        staffMap.set(user.id, {
          id: user.id,
          name: user.fullName,
          departmentName: dept?.name || 'N/A',
        });
      }
    });
    
    return Array.from(staffMap.values());
  }, [adminDepartments, users]);

  // Filter staff users
  const adminStaffUsers = useMemo(() => {
    const staffIds = new Set<string>();
    adminDepartments.forEach(dept => {
      dept.staffIds.forEach(id => staffIds.add(id));
    });
    return users
      .filter(user => 
        (user.role === 'it-staff' || user.role === 'facility-staff') && 
        staffIds.has(user.id)
      )
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [users, adminDepartments]);

  const paginatedStaffUsers = useMemo(() => {
    const startIndex = (staffPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return adminStaffUsers.slice(startIndex, endIndex);
  }, [adminStaffUsers, staffPage]);

  const totalStaffPages = Math.ceil(adminStaffUsers.length / itemsPerPage);

  // Filter student users
  const studentUsers = useMemo(() => {
    return users
      .filter(user => user.role === 'student' || user.role === 'teacher')
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [users]);

  const paginatedStudentUsers = useMemo(() => {
    const startIndex = (usersPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return studentUsers.slice(startIndex, endIndex);
  }, [studentUsers, usersPage]);

  const totalUsersPages = Math.ceil(studentUsers.length / itemsPerPage);

  // Handlers
  const handleAssignTicket = (ticketId: string, staffId: string) => {
    const staff = adminStaffList.find(s => s.id === staffId);
    if (!staff) return;
    assignTicket(ticketId, staffId, staff.name);
  };

  const handleCancelTicket = (ticketId: string) => {
    const reason = prompt('Lý do hủy ticket (ví dụ: Báo cáo sai, spam, không thuộc phạm vi xử lý):');
    if (reason === null) return;
    cancelTicket(ticketId, reason);
  };

  const handleUpdatePriority = (ticketId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    updateTicketPriority(ticketId, newPriority);
  };

  const handleApproveTicket = (ticketId: string) => {
    // Chấp nhận ticket: chuyển từ 'open' sang 'acknowledged'
    updateTicketStatus(ticketId, 'acknowledged');
  };

  const handleRejectTicket = (ticketId: string, reason: string) => {
    // Từ chối ticket: chuyển sang 'cancelled' với lý do
    cancelTicket(ticketId, reason);
  };


  return (
    <div className="max-w-[1400px] mx-auto p-8">

      {/* Dashboard Layout */}
      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <div className="w-72 bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-8">
          <h3 className="m-0 mb-6 text-base text-gray-900 font-semibold uppercase tracking-wide pb-4 border-b border-gray-200">
            Quản lý hệ thống
          </h3>
          <nav className="flex flex-col gap-1">
            {/* Tickets */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'tickets'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Quản lý Tickets
            </button>
            
            {/* Members submenu */}
            <div>
              <button
                className={`w-full py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 flex items-center justify-between group ${
                  (activeTab === 'staff' || activeTab === 'users')
                    ? 'bg-orange-500 text-white font-semibold border-l-4 border-orange-600'
                    : 'text-gray-700 font-medium hover:bg-orange-500 hover:text-white'
                }`}
                onClick={() => setShowMembersSubmenu(!showMembersSubmenu)}
              >
                <span>Quản lý thành viên</span>
                <span className={`transition-all duration-200 text-xs ${
                  (activeTab === 'staff' || activeTab === 'users')
                    ? 'text-white'
                    : 'text-gray-700 group-hover:text-white'
                } ${showMembersSubmenu ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>
              {showMembersSubmenu && (
                <div className="ml-4 mt-1 flex flex-col gap-1">
                  <button
                    className={`py-2 px-4 rounded-md cursor-pointer text-xs text-left transition-all duration-200 ${
                      activeTab === 'staff'
                        ? 'bg-orange-100 text-orange-700 font-semibold border-l-2 border-orange-600'
                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setActiveTab('staff');
                      setStaffPage(1);
                      setShowMembersSubmenu(true);
                    }}
                  >
                    Quản lý Staff
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md cursor-pointer text-xs text-left transition-all duration-200 ${
                      activeTab === 'users'
                        ? 'bg-orange-100 text-orange-700 font-semibold border-l-2 border-orange-600'
                        : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      setActiveTab('users');
                      setUsersPage(1);
                      setShowMembersSubmenu(true);
                    }}
                  >
                    Quản lý Người dùng
                  </button>
                </div>
              )}
            </div>
            
            {/* Categories */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Quản lý Danh mục
            </button>
            
            {/* Departments */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'departments'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('departments')}
            >
              Quản lý Bộ phận
            </button>
            
            {/* Locations */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'locations'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('locations')}
            >
              Quản lý Địa điểm
            </button>
            
            {/* Reports */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                  : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              Báo cáo
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          {/* Tickets Management */}
          {activeTab === 'tickets' && (
            <TicketsTable
              tickets={adminTickets}
              locations={locations}
              staffList={adminStaffList}
              onAssignTicket={handleAssignTicket}
              onViewTicket={setSelectedTicketForReview}
            />
          )}

          {/* Category Management */}
          {activeTab === 'categories' && (
            <CategoryList
              categories={adminCategories}
              departments={adminDepartments}
              searchQuery={categorySearchQuery}
              onSearchChange={setCategorySearchQuery}
              onAddClick={() => {
                setEditingCategory(null);
                setCategoryFormData({
                  code: '',
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
              onEditClick={(cat) => {
                setEditingCategory(cat);
                setCategoryFormData({
                  code: cat.code || '',
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
            />
          )}
          {/* Department Management */}
          {activeTab === 'departments' && (
            <DepartmentList
              departments={adminDepartments}
              searchQuery={departmentSearchQuery}
              onSearchChange={setDepartmentSearchQuery}
              onAddClick={() => {
                setEditingDept(null);
                setDeptFormData({ name: '', description: '', location: '', adminId: currentAdminId, staffIds: [] });
                setIsFormOpen(true);
              }}
              onEditClick={(dept) => {
                setEditingDept(dept);
                setDeptFormData({
                  name: dept.name,
                  description: dept.description,
                  location: dept.location,
                  adminId: dept.adminId || currentAdminId,
                  staffIds: dept.staffIds || [],
                });
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Location Management */}
          {activeTab === 'locations' && (
            <LocationList
              locations={locations}
              searchQuery={locationSearchQuery}
              filterStatus={locationFilterStatus}
              onSearchChange={setLocationSearchQuery}
              onFilterStatusChange={setLocationFilterStatus}
              onAddClick={() => {
                setEditingLocation(null);
                setLocationFormData({
                  code: '',
                  name: '',
                  description: '',
                  type: 'classroom',
                  floor: '',
                  status: 'active',
                });
                setIsFormOpen(true);
              }}
              onEditClick={(location) => {
                setEditingLocation(location);
                setLocationFormData({
                  code: location.code || '',
                  name: location.name,
                  description: location.description || '',
                  type: location.type,
                  floor: location.floor || '',
                  status: location.status,
                });
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Staff Management */}
          {activeTab === 'staff' && (
            <StaffList
              staffUsers={adminStaffUsers}
              departments={adminDepartments}
              searchQuery={staffSearchQuery}
              currentPage={staffPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalStaffPages}
              onSearchChange={setStaffSearchQuery}
              onPageChange={setStaffPage}
              onAddClick={() => {
                setEditingStaff(null);
                setStaffFormData({
                  username: '',
                  password: '',
                  fullName: '',
                  email: '',
                  role: 'it-staff',
                  departmentId: adminDepartments[0]?.id || '',
                });
                setIsFormOpen(true);
              }}
              onEditClick={(staff) => {
                const dept = adminDepartments.find(d => d.staffIds.includes(staff.id));
                setEditingStaff(staff);
                setStaffFormData({
                  username: staff.username,
                  password: staff.password,
                  fullName: staff.fullName,
                  email: staff.email,
                  role: staff.role,
                  departmentId: dept?.id || '',
                });
                setIsFormOpen(true);
              }}
              onResetPassword={(staffId) => {
                const newPassword = prompt('Nhập mật khẩu mới:');
                if (newPassword && newPassword.trim()) {
                  updateUser(staffId, { password: newPassword.trim() });
                  alert('Đã cấp lại mật khẩu thành công!');
                }
              }}
              onToggleStatus={(staffId, currentStatus) => {
                if (currentStatus === 'active') {
                  if (confirm('Bạn có chắc chắn muốn vô hiệu hóa staff này? Staff sẽ không thể đăng nhập nữa.')) {
                    updateUser(staffId, { status: 'inactive' });
                  }
                } else {
                  if (confirm('Bạn có chắc chắn muốn kích hoạt lại staff này?')) {
                    updateUser(staffId, { status: 'active' });
                  }
                }
              }}
            />
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <UserList
              users={studentUsers}
              searchQuery={userSearchQuery}
              currentPage={usersPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalUsersPages}
              onSearchChange={setUserSearchQuery}
              onPageChange={setUsersPage}
              onEditClick={(user) => {
                setEditingUser(user);
                setUserFormData({
                  username: user.username,
                  password: user.password || '',
                  fullName: user.fullName,
                  email: user.email,
                });
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <ReportsPage
              tickets={tickets}
              categories={categories}
              departments={departments}
              users={users}
              adminDepartments={adminDepartments}
            />
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {isFormOpen && activeTab === 'categories' && (
        <CategoryForm
          editingCategory={editingCategory}
          categoryFormData={categoryFormData}
          adminDepartments={adminDepartments}
          onFormDataChange={setCategoryFormData}
          onSubmit={() => {
            if (editingCategory) {
              updateCategory(editingCategory.id, categoryFormData);
            } else {
              createCategory(categoryFormData);
            }
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
          onDelete={editingCategory ? () => {
            deleteCategory(editingCategory.id);
          } : undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Department Form Modal */}
      {isFormOpen && activeTab === 'departments' && (
        <DepartmentForm
          editingDept={editingDept}
          deptFormData={deptFormData}
          onFormDataChange={setDeptFormData}
          onSubmit={() => {
            if (editingDept) {
              updateDepartment(editingDept.id, deptFormData);
            } else {
              createDepartment(deptFormData);
            }
            setIsFormOpen(false);
            setEditingDept(null);
          }}
          onDelete={editingDept ? () => {
            deleteDepartment(editingDept.id);
          } : undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingDept(null);
          }}
        />
      )}

      {/* Location Form Modal */}
      {isFormOpen && activeTab === 'locations' && (
        <LocationForm
          editingLocation={editingLocation}
          locationFormData={locationFormData}
          onFormDataChange={setLocationFormData}
          onSubmit={() => {
            if (editingLocation) {
              updateLocation(editingLocation.id, locationFormData);
            } else {
              createLocation(locationFormData);
            }
            setIsFormOpen(false);
            setEditingLocation(null);
          }}
          onDelete={editingLocation ? () => {
            deleteLocation(editingLocation.id);
          } : undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingLocation(null);
          }}
        />
      )}

      {/* Staff Form Modal */}
      {isFormOpen && activeTab === 'staff' && (
        <StaffForm
          editingStaff={editingStaff}
          staffFormData={staffFormData}
          adminDepartments={adminDepartments}
          onFormDataChange={setStaffFormData}
          onSubmit={() => {
            if (editingStaff) {
              updateUser(editingStaff.id, {
                username: staffFormData.username,
                password: staffFormData.password,
                fullName: staffFormData.fullName,
                email: staffFormData.email,
                role: staffFormData.role,
              });
              
              // Update department's staffIds if department changed
              const oldDept = adminDepartments.find(d => d.staffIds.includes(editingStaff.id));
              if (oldDept && oldDept.id !== staffFormData.departmentId) {
                // Remove from old department
                const oldDeptUpdated = departments.find(d => d.id === oldDept.id);
                if (oldDeptUpdated) {
                  updateDepartment(oldDept.id, {
                    staffIds: oldDeptUpdated.staffIds.filter(id => id !== editingStaff.id),
                  });
                }
                // Add to new department
                const newDept = departments.find(d => d.id === staffFormData.departmentId);
                if (newDept) {
                  updateDepartment(newDept.id, {
                    staffIds: [...newDept.staffIds, editingStaff.id],
                  });
                }
              }
            } else {
              const newStaff = createUser({
                username: staffFormData.username,
                password: staffFormData.password,
                fullName: staffFormData.fullName,
                email: staffFormData.email,
                role: staffFormData.role,
                departmentId: staffFormData.departmentId, // Set departmentId when creating staff
              });
              
              // Add to department's staffIds
              if (staffFormData.departmentId) {
                const dept = departments.find(d => d.id === staffFormData.departmentId);
                if (dept) {
                  updateDepartment(dept.id, {
                    staffIds: [...dept.staffIds, newStaff.id],
                  });
                }
              }
              setStaffPage(1);
            }
            setIsFormOpen(false);
            setEditingStaff(null);
          }}
          onResetPassword={editingStaff ? () => {
            const newPassword = prompt('Nhập mật khẩu mới:');
            if (newPassword && newPassword.trim()) {
              updateUser(editingStaff.id, { password: newPassword.trim() });
            }
          } : undefined}
          onToggleStatus={editingStaff ? () => {
            if (editingStaff.status === 'active') {
              updateUser(editingStaff.id, { status: 'inactive' });
            } else {
              updateUser(editingStaff.id, { status: 'active' });
            }
          } : undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStaff(null);
          }}
        />
      )}

      {/* User Form Modal */}
      {isFormOpen && activeTab === 'users' && (
        <UserForm
          editingUser={editingUser}
          userFormData={userFormData}
          userTickets={editingUser ? getTicketsByUserId(editingUser.id) : []}
          onFormDataChange={setUserFormData}
          onSubmit={() => {
            // Chỉ cho phép tạo user mới, không cho phép cập nhật
            if (!editingUser) {
              createUser({
                ...userFormData,
                role: 'student', // Default role for new users
              });
              setIsFormOpen(false);
              setEditingUser(null);
            }
          }}
          onToggleBan={editingUser ? () => {
            if (editingUser.status === 'active') {
              updateUser(editingUser.id, { status: 'banned' });
            } else if (editingUser.status === 'banned') {
              updateUser(editingUser.id, { status: 'active' });
            }
          } : undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Ticket Review Modal */}
      {selectedTicketForReview && (
        <TicketReviewModal
          ticket={selectedTicketForReview}
          staffList={adminStaffList}
          onApprove={handleApproveTicket}
          onReject={handleRejectTicket}
          onAssign={handleAssignTicket}
          onClose={() => setSelectedTicketForReview(null)}
        />
      )}
    </div>
  );
};

export default AdminPage;
