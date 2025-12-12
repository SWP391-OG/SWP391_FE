import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, Department, Location, Category, Priority, Ticket, TicketFromApi } from '../../types';
import { useTickets } from '../../hooks/useTickets';
import { useCategories } from '../../hooks/useCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useLocations } from '../../hooks/useLocations';
import { useUsers } from '../../hooks/useUsers';
import { ticketService } from '../../services/ticketService';
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
  const { locations, loading: locationsLoading, createLocation, updateLocation, updateLocationStatus, deleteLocation } = useLocations();
  const { users, loading: usersLoading, createUser, updateUser, deleteUser, getStaffUsers, getStudentUsers } = useUsers();

  // State for API tickets
  const [apiTickets, setApiTickets] = useState<TicketFromApi[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Fetch tickets from API
  const fetchTickets = async () => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const response = await ticketService.getAllTicketsFromApi(1, 100); // Fetch first 100 tickets
      console.log('✅ Fetched tickets from API:', response);
      setApiTickets(response.data.items);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTicketsError(error instanceof Error ? error.message : 'Failed to fetch tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []); // Run once on mount

  // Debug categories
  console.log('📊 Admin Page - Categories:', {
    count: categories?.length || 0,
    categories: categories,
    isArray: Array.isArray(categories)
  });

  // Debug departments
  console.log('🏢 Admin Page - Departments:', {
    count: departments?.length || 0,
    departments: departments,
    isArray: Array.isArray(departments)
  });

  // Debug tickets
  console.log('🎫 Admin Page - Tickets:', {
    apiTicketsCount: apiTickets.length,
    localTicketsCount: tickets.length,
    loadingTickets,
    ticketsError
  });

  // UI State
  const [activeTab, setActiveTab] = useState<AdminTab>('tickets');
  const [showMembersSubmenu, setShowMembersSubmenu] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketForReview, setSelectedTicketForReview] = useState<Ticket | TicketFromApi | null>(null);
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
    console.log('🔍 Filtering departments:', {
      totalDepartments: departments.length,
      currentAdminId: currentAdminId,
      departments: departments.map(d => ({ code: d.deptCode, name: d.deptName, adminId: d.adminId }))
    });
    
    // Tạm thời hiển thị tất cả departments vì API chưa trả về adminId
    // TODO: Sau khi backend thêm adminId thì uncomment phần filter
    return departments;
    
    /*
    // Filter theo adminId khi backend có field này
    return departments.filter(dept => dept.adminId === currentAdminId);
    */
  }, [departments, currentAdminId]);

  const adminDepartmentIds = useMemo(() => {
    // Map cả deptCode và id để tương thích với cả backend mới và code cũ
    const ids = adminDepartments.flatMap(dept => [
      dept.deptCode,           // Backend API format
      dept.id,                 // Legacy format
      dept.deptCode?.toString(), // String version
      dept.id?.toString()      // String version
    ].filter(Boolean));
    
    console.log('🔑 Admin Department IDs:', ids);
    return [...new Set(ids)]; // Remove duplicates
  }, [adminDepartments]);

  // Filter categories by admin's departments
  const adminCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      console.warn('⚠️ categories is not an array:', categories);
      return [];
    }
    
    console.log('🔍 Filtering categories:', {
      totalCategories: categories.length,
      adminDepartmentIds: adminDepartmentIds,
      categories: categories.map(c => ({ code: c.categoryCode, deptId: c.departmentId }))
    });
    
    // Tạm thời hiển thị tất cả categories để test
    // TODO: Sau khi có department data đúng thì uncomment phần filter
    return categories;
    
    /*
    // Convert departmentId to string for comparison
    return categories.filter(cat => {
      const deptIdStr = cat.departmentId?.toString();
      return deptIdStr && adminDepartmentIds.includes(deptIdStr);
    });
    */
  }, [categories, adminDepartmentIds]);

  // Debug filtered data (after useMemo declarations)
  console.log('🏢 Admin Departments (filtered):', {
    count: adminDepartments?.length || 0,
    adminDepartments: adminDepartments
  });
  
  console.log('📊 Admin Categories (filtered):', {
    count: adminCategories?.length || 0,
    adminCategories: adminCategories
  });

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
    console.log('🔍 DEBUG Admin Tickets Filtering:', {
      totalTickets: tickets.length,
      adminDepartmentIds,
      availableCategories: categories.map(c => ({ name: c.name, departmentId: c.departmentId })),
    });

    const filtered = tickets.filter(ticket => {
      if (ticket.status === 'cancelled') return false;
      
      const matchingCategoryNames = categoryNameMap[ticket.category] || [];
      const matchingCategories = categories.filter(cat => 
        matchingCategoryNames.includes(cat.name)
      );
      
      const isMatch = matchingCategories.some(cat => 
        adminDepartmentIds.includes(cat.departmentId)
      );

      // Debug each ticket
      if (!isMatch || matchingCategories.length === 0) {
        console.log(`❌ Ticket FILTERED OUT:`, {
          id: ticket.id.substring(0, 8),
          title: ticket.title,
          category: ticket.category,
          status: ticket.status,
          expectedCategoryNames: matchingCategoryNames,
          matchingCategories: matchingCategories.map(c => ({ name: c.name, deptId: c.departmentId })),
          adminDepartmentIds,
          reason: matchingCategories.length === 0 ? 'No matching category name' : 'Category not in admin departments',
        });
      } else {
        console.log(`✅ Ticket INCLUDED:`, {
          id: ticket.id.substring(0, 8),
          title: ticket.title,
          category: ticket.category,
        });
      }
      
      return isMatch;
    });

    console.log(`📊 Result: ${filtered.length} of ${tickets.length} tickets shown`);
    return filtered;
  }, [tickets, categories, adminDepartmentIds, categoryNameMap]);

  // Get staff list for admin's departments - Đơn giản hóa để lấy tất cả staff từ API
  const adminStaffList = useMemo(() => {
    // Lấy tất cả staff users (it-staff + facility-staff) từ hook
    const staffList = getStaffUsers.map(user => {
      const dept = departments.find(d => d.id === user.departmentId);
      return {
        id: user.id,
        name: user.fullName,
        departmentName: dept?.name || dept?.deptName || 'N/A',
        userCode: user.userCode || user.id, // userCode để gửi cho backend
      };
    });
    
    console.log('👥 Admin Staff List:', {
      count: staffList.length,
      staffList,
      getStaffUsersCount: getStaffUsers.length,
      departmentsCount: departments.length,
    });
    
    return staffList;
  }, [getStaffUsers, departments]);

  // Filter staff users
  // Filter staff users - Lấy từ hook getStaffUsers (đã filter it-staff + facility-staff)
  const adminStaffUsers = useMemo(() => {
    return getStaffUsers
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [getStaffUsers]);

  const paginatedStaffUsers = useMemo(() => {
    const startIndex = (staffPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return adminStaffUsers.slice(startIndex, endIndex);
  }, [adminStaffUsers, staffPage]);

  const totalStaffPages = Math.ceil(adminStaffUsers.length / itemsPerPage);

  // Filter student users - Lấy từ hook getStudentUsers (đã filter student + teacher, không có admin)
  const studentUsers = useMemo(() => {
    return getStudentUsers
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [getStudentUsers]);

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
    <div className="min-h-screen max-w-[1400px] mx-auto p-8">

      {/* Dashboard Layout */}
      <div className="flex gap-8 items-start">{/* Sidebar */}
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
            <>
              {loadingTickets && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-gray-600">Đang tải tickets...</p>
                </div>
              )}
              {ticketsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <strong>Lỗi:</strong> {ticketsError}
                </div>
              )}
              {!loadingTickets && !ticketsError && (
                <TicketsTable
                  tickets={apiTickets}
                  locations={locations}
                  staffList={adminStaffList}
                  onAssignTicket={handleAssignTicket}
                  onViewTicket={setSelectedTicketForReview}
                />
              )}
            </>
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
              loading={locationsLoading}
              searchQuery={locationSearchQuery}
              filterStatus={locationFilterStatus}
              onSearchChange={setLocationSearchQuery}
              onFilterStatusChange={setLocationFilterStatus}
              onAddClick={() => {
                setEditingLocation(null);
                setLocationFormData({
                  code: '',
                  name: '',
                  status: 'active',
                });
                setIsFormOpen(true);
              }}
              onEditClick={(location) => {
                setEditingLocation(location);
                setLocationFormData({
                  code: location.code || '',
                  name: location.name,
                  status: location.status || 'active',
                });
                setIsFormOpen(true);
              }}
              onToggleStatus={(locationCode, currentStatus) => {
                const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                const message = newStatus === 'inactive' 
                  ? 'Bạn có chắc chắn muốn vô hiệu hóa địa điểm này?'
                  : 'Bạn có chắc chắn muốn kích hoạt lại địa điểm này?';
                
                if (confirm(message)) {
                  updateLocationStatus(locationCode, newStatus);
                }
              }}
            />
          )}

          {/* Staff Management */}
          {activeTab === 'staff' && (
            <StaffList
              staffUsers={adminStaffUsers}
              departments={adminDepartments}
              loading={usersLoading}
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
                // Tìm department của staff dựa vào staff.departmentId
                const dept = adminDepartments.find(d => d.id === staff.departmentId);
                setEditingStaff(staff);
                setStaffFormData({
                  username: staff.username,
                  password: staff.password,
                  fullName: staff.fullName,
                  email: staff.email,
                  role: staff.role,
                  departmentId: dept?.id || staff.departmentId || '',
                });
                setIsFormOpen(true);
              }}
              onResetPassword={(staffId) => {
                const newPassword = prompt('Nhập mật khẩu mới:');
                if (newPassword && newPassword.trim()) {
                  // Note: Reset password cần endpoint riêng (chưa có trong API spec)
                  alert('Tính năng reset password đang được phát triển');
                }
              }}
              onToggleStatus={async (userCode, currentStatus) => {
                const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
                const message = newStatus === 'inactive' 
                  ? 'Bạn có chắc chắn muốn vô hiệu hóa staff này? Staff sẽ không thể đăng nhập nữa.'
                  : 'Bạn có chắc chắn muốn kích hoạt lại staff này?';
                
                if (confirm(message)) {
                  try {
                    await updateUser(userCode, { status: newStatus });
                  } catch (error) {
                    alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }
              }}
            />
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <UserList
              users={studentUsers}
              loading={usersLoading}
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
              onToggleStatus={async (userCode, currentStatus) => {
                let newStatus: 'active' | 'inactive' | 'banned';
                let message: string;
                
                if (currentStatus === 'banned') {
                  newStatus = 'active';
                  message = 'Bạn có chắc chắn muốn mở khóa người dùng này?';
                } else if (currentStatus === 'active') {
                  newStatus = 'banned';
                  message = 'Bạn có chắc chắn muốn khóa người dùng này? Người dùng sẽ không thể đăng nhập nữa.';
                } else {
                  newStatus = 'active';
                  message = 'Bạn có chắc chắn muốn kích hoạt lại người dùng này?';
                }
                
                if (confirm(message)) {
                  try {
                    await updateUser(userCode, { status: newStatus });
                  } catch (error) {
                    alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }
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
          onSubmit={async () => {
            try {
              if (editingLocation) {
                // Update existing location
                await updateLocation(
                  editingLocation.code || editingLocation.id, 
                  { name: locationFormData.name }
                );
                
                // Update status if changed
                if (locationFormData.status !== editingLocation.status) {
                  await updateLocationStatus(
                    editingLocation.code || editingLocation.id,
                    locationFormData.status
                  );
                }
              } else {
                // Create new location
                await createLocation({
                  code: locationFormData.code,
                  name: locationFormData.name,
                });
              }
              
              setIsFormOpen(false);
              setEditingLocation(null);
            } catch (error) {
              console.error('Error saving location:', error);
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
          }}
          onDelete={editingLocation ? async () => {
            try {
              await deleteLocation(editingLocation.code || editingLocation.id);
              setIsFormOpen(false);
              setEditingLocation(null);
            } catch (error) {
              console.error('Error deleting location:', error);
              alert('Có lỗi xảy ra khi xóa: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
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
          onSubmit={async () => {
            try {
              if (editingStaff) {
                // Update existing staff
                await updateUser(editingStaff.userCode || editingStaff.id, {
                  fullName: staffFormData.fullName,
                  phoneNumber: staffFormData.email, // Temp - cần phoneNumber field
                  role: staffFormData.role,
                  departmentId: parseInt(staffFormData.departmentId),
                });
              } else {
                // Create new staff
                await createUser({
                  userCode: staffFormData.username, // Use username as userCode
                  fullName: staffFormData.fullName,
                  password: staffFormData.password,
                  email: staffFormData.email,
                  phoneNumber: '', // Optional
                  role: staffFormData.role,
                  departmentId: parseInt(staffFormData.departmentId),
                });
                
                setStaffPage(1);
              }
              
              setIsFormOpen(false);
              setEditingStaff(null);
            } catch (error) {
              console.error('Error saving staff:', error);
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
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
          onSubmit={async () => {
            try {
              if (editingUser) {
                // Update existing user
                await updateUser(editingUser.userCode || editingUser.id, {
                  fullName: userFormData.fullName,
                });
              } else {
                // Create new user
                await createUser({
                  userCode: userFormData.username,
                  fullName: userFormData.fullName,
                  password: userFormData.password,
                  email: userFormData.email,
                  role: 'student', // Default role
                });
              }
              
              setIsFormOpen(false);
              setEditingUser(null);
            } catch (error) {
              console.error('Error saving user:', error);
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
          }}
          onToggleBan={editingUser ? async () => {
            try {
              const newStatus = editingUser.status === 'active' ? 'banned' : 'active';
              await updateUser(editingUser.userCode || editingUser.id, { status: newStatus });
            } catch (error) {
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
          isStudentView={false}
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
          onAssignSuccess={fetchTickets}
        />
      )}
    </div>
  );
};

export default AdminPage;
