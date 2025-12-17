import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, Department, Location, Category, Priority, Ticket, TicketFromApi } from '../../types';
import { useTickets } from '../../hooks/useTickets';
import { useCategories } from '../../hooks/useCategories';
import { useDepartments } from '../../hooks/useDepartments';
import { useLocations } from '../../hooks/useLocations';
import { useUsers } from '../../hooks/useUsers';
import { useOverdueTickets } from '../../hooks/useOverdueTickets';
import { ticketService } from '../../services/ticketService';
import { campusService, type Campus } from '../../services/campusService';
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
import OverdueTicketsPanel from '../../components/admin/OverdueTicketsPanel';

type AdminTab = 'categories' | 'departments' | 'locations' | 'tickets' | 'staff' | 'users' | 'reports' | 'overdue';

interface AdminPageProps {
  currentAdminId?: string;
}

const AdminPage = ({ currentAdminId = 'admin-001' }: AdminPageProps) => {
  // Hooks
  const { tickets, assignTicket, cancelTicket, updateTicketStatus, getTicketsByUserId } = useTickets();
  const { categories, createCategory, updateCategory, updateCategoryStatus, loadCategories } = useCategories();
  const { departments, createDepartment, updateDepartment, updateDepartmentStatus, loadDepartments } = useDepartments();
  const { locations, loading: locationsLoading, createLocation, updateLocation, loadLocations } = useLocations();
  const { users, loading: usersLoading, createUser, updateUser, updateUserStatus, getStaffUsers, getStudentUsers, loadUsers } = useUsers();
  const { overdueTickets, loading: overdueLoading, error: overdueError, refetch: refetchOverdue, escalateTicket, isEscalating } = useOverdueTickets();

  // State for API tickets
  const [apiTickets, setApiTickets] = useState<TicketFromApi[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  // Fetch tickets from API
  const fetchTickets = async (pageNumber: number = 1, pageSize: number = 10) => {
    setLoadingTickets(true);
    setTicketsError(null);
    try {
      const response = await ticketService.getAllTicketsFromApi(pageNumber, pageSize);
      console.log('✅ Fetched tickets from API:', response);
      setApiTickets(response.data.items);
      setPaginationState({
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasPrevious: response.data.hasPrevious,
        hasNext: response.data.hasNext,
      });
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTicketsError(error instanceof Error ? error.message : 'Failed to fetch tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets(1, 10);
  }, []); // Run once on mount with page 1 and size 10

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

  // Form state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form data
  const [categoryFormData, setCategoryFormData] = useState({
    categoryCode: '',
    categoryName: '',
    departmentId: 0,
    slaResolveHours: 24,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    // Frontend-only fields (not sent to API)
    icon: '📋',
    color: '#3b82f6',
    defaultPriority: 'medium' as Priority,
  });

  const [deptFormData, setDeptFormData] = useState({
    deptCode: '',
    deptName: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [locationFormData, setLocationFormData] = useState({
    code: '',
    name: '',
    status: 'active' as 'active' | 'inactive',
    campusCode: '',
    campusId: undefined as number | undefined,
  });
  
  // Load campuses
  const [campuses, setCampuses] = useState<Campus[]>([]);
  useEffect(() => {
    const loadCampuses = async () => {
      try {
        const data = await campusService.getAllCampuses();
        console.log('📍 Loaded campuses:', data);
        // Check if campuses have campusId
        if (data.length > 0 && !data[0].campusId) {
          console.warn('⚠️ Campuses from API do not have campusId. Backend may need to return campusId field.');
        }
        setCampuses(data);
      } catch (error) {
        console.error('Error loading campuses:', error);
      }
    };
    loadCampuses();
  }, []);

  const [staffFormData, setStaffFormData] = useState({
    userCode: '',
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
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
    adminCategories: adminCategories?.map(c => ({ 
      code: c.categoryCode, 
      name: c.categoryName,
      deptId: c.departmentId,
      deptIdType: typeof c.departmentId
    })),
  });

  // Get staff list for admin's departments - Đơn giản hóa để lấy tất cả staff từ API
  const adminStaffList = useMemo(() => {
    // Lấy tất cả staff users (it-staff + facility-staff) từ hook
    const staffList = getStaffUsers.map(user => {
      const dept = departments.find(d => d.id === user.departmentId);
      return {
        id: String(user.id),
        name: user.fullName,
        departmentId: String(user.departmentId || ''),
        departmentName: dept?.name || dept?.deptName || 'N/A',
        userCode: user.userCode || String(user.id),
      };
    });
    
    return staffList;
  }, [getStaffUsers, departments]);

  const totalStaffPages = Math.ceil(getStaffUsers.length / itemsPerPage);

  // Filter student users - Lấy từ hook getStudentUsers (đã filter student + teacher, không có admin)
  const studentUsers = useMemo(() => {
    return getStudentUsers
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [getStudentUsers]);

  const totalUsersPages = Math.ceil(studentUsers.length / itemsPerPage);

  // Handlers
  const handleAssignTicket = (ticketId: string, staffId: string) => {
    const staff = adminStaffList.find(s => s.id === staffId);
    if (!staff) return;
    assignTicket(ticketId, staffId, staff.name);
  };

  const handleApproveTicket = (ticketId: string) => {
    // Chấp nhận ticket: chuyển từ 'open' sang 'acknowledged'
    updateTicketStatus(ticketId, 'acknowledged');
  };

  const handleRejectTicket = (ticketId: string, reason: string) => {
    // Từ chối ticket: chuyển sang 'cancelled' với lý do
    cancelTicket(ticketId, reason);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    fetchTickets(page, paginationState.pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    fetchTickets(1, size); // Reset to page 1 when changing page size
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

            {/* Overdue/Escalate - Critical tickets */}
            <button
              className={`py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 ${
                activeTab === 'overdue'
                  ? 'bg-red-50 text-red-700 font-semibold border-l-4 border-red-600'
                  : 'text-red-600 font-medium hover:bg-red-50 hover:text-red-700'
              }`}
              onClick={() => setActiveTab('overdue')}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🔴</span>
                <span>Tickets Quá Hạn ({overdueTickets.length})</span>
              </span>
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
                  pageNumber={paginationState.pageNumber}
                  pageSize={paginationState.pageSize}
                  totalPages={paginationState.totalPages}
                  totalCount={paginationState.totalCount}
                  hasPrevious={paginationState.hasPrevious}
                  hasNext={paginationState.hasNext}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
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
                  categoryCode: '',
                  categoryName: '',
                  departmentId: 0,
                  slaResolveHours: 24,
                  status: 'ACTIVE',
                  icon: '📋',
                  color: '#3b82f6',
                  defaultPriority: 'medium',
                });
                setIsFormOpen(true);
              }}
              onEditClick={(cat) => {
                setEditingCategory(cat);
                const deptId = typeof cat.departmentId === 'string' ? parseInt(cat.departmentId, 10) || 0 : (cat.departmentId || 0);
                setCategoryFormData({
                  categoryCode: cat.categoryCode,
                  categoryName: cat.categoryName,
                  departmentId: deptId,
                  slaResolveHours: cat.slaResolveHours,
                  status: cat.status,
                  icon: '📋', // Frontend-only
                  color: '#3b82f6', // Frontend-only
                  defaultPriority: 'medium', // Frontend-only
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
                setDeptFormData({ deptCode: '', deptName: '', status: 'ACTIVE' });
                setIsFormOpen(true);
              }}
              onEditClick={(dept) => {
                setEditingDept(dept);
                setDeptFormData({
                  deptCode: dept.deptCode,
                  deptName: dept.deptName,
                  status: dept.status,
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
              campuses={campuses}
              onSearchChange={setLocationSearchQuery}
              onFilterStatusChange={setLocationFilterStatus}
              onAddClick={() => {
                setEditingLocation(null);
                setLocationFormData({
                  code: '',
                  name: '',
                  status: 'active',
                  campusCode: '',
                  campusId: undefined,
                });
                setIsFormOpen(true);
              }}
              onEditClick={(location) => {
                setEditingLocation(location);
                // Find campus from location's campusId or campusCode
                const locationCampus = campuses.find(c => 
                  c.campusId === location.campusId || 
                  c.campusCode === location.campusCode
                );
                setLocationFormData({
                  code: location.code || '',
                  name: location.name,
                  status: location.status || 'active',
                  campusCode: locationCampus?.campusCode || location.campusCode || '',
                  campusId: locationCampus?.campusId || location.campusId,
                });
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Staff Management */}
          {activeTab === 'staff' && (
            <StaffList
              staffUsers={getStaffUsers}
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
                  userCode: '',
                  username: '',
                  password: '',
                  fullName: '',
                  email: '',
                  phoneNumber: '',
                  role: 'it-staff',
                  departmentId: adminDepartments[0]?.id ? String(adminDepartments[0].id) : '',
                });
                setIsFormOpen(true);
              }}
              onEditClick={(staff) => {
                // Tìm department của staff dựa vào staff.departmentId (number từ API)
                // Department.id là string, cần convert để so sánh
                const dept = adminDepartments.find(d => 
                  d.id === staff.departmentId?.toString() || 
                  d.deptCode === staff.departmentId?.toString()
                );
                setEditingStaff(staff);
                const deptId = dept?.id ? String(dept.id) : (staff.departmentId?.toString() || '');
                setStaffFormData({
                  userCode: staff.userCode || '',
                  username: staff.username || staff.email || '',
                  password: '', // Không load password (không thể edit)
                  fullName: staff.fullName,
                  email: staff.email,
                  phoneNumber: staff.phoneNumber || '',
                  role: staff.role,
                  departmentId: deptId,
                });
                setIsFormOpen(true);
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
                  role: user.role,
                });
                setIsFormOpen(true);
              }}
            />
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <ReportsPage
              tickets={apiTickets}
              categories={categories}
              departments={departments}
              users={users}
              adminDepartments={adminDepartments}
            />
          )}

          {/* Overdue Tickets / Escalation Management */}
          {activeTab === 'overdue' && (
            <OverdueTicketsPanel
              overdueTickets={overdueTickets}
              loading={overdueLoading}
              error={overdueError}
              onEscalate={escalateTicket}
              isEscalating={isEscalating}
              onRefresh={refetchOverdue}
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
          onFormDataChange={setCategoryFormData as any}
          onSubmit={async () => {
            try {
              if (editingCategory) {
                // Update: lấy categoryId từ editingCategory
                // categoryId có thể là number hoặc string (backward compatibility)
                let categoryId: number;
                if (typeof editingCategory.id === 'number') {
                  categoryId = editingCategory.id;
                } else if (typeof editingCategory.id === 'string') {
                  const parsed = parseInt(editingCategory.id, 10);
                  if (isNaN(parsed) || parsed <= 0) {
                    // Fallback: tìm categoryId từ list bằng categoryCode
                    const found = categories.find(c => c.categoryCode === editingCategory.categoryCode);
                    if (found && typeof found.id === 'number') {
                      categoryId = found.id;
                    } else {
                      throw new Error('Không tìm thấy categoryId. Vui lòng reload trang và thử lại.');
                    }
                  } else {
                    categoryId = parsed;
                  }
                } else {
                  // Fallback: tìm categoryId từ list bằng categoryCode
                  const found = categories.find(c => c.categoryCode === editingCategory.categoryCode);
                  if (found && typeof found.id === 'number') {
                    categoryId = found.id;
                  } else {
                    throw new Error('Không tìm thấy categoryId. Vui lòng reload trang và thử lại.');
                  }
                }

                console.log('📋 Updating category:', { categoryId, editingCategory, categoryFormData });

                // Update status trước nếu có thay đổi (để tránh vấn đề với categoryId sau khi update)
                const oldStatus = editingCategory.status;
                const newStatus = categoryFormData.status;
                if (oldStatus !== newStatus) {
                  console.log('📋 Updating category status BEFORE update:', { categoryId, oldStatus, newStatus });
                  try {
                    await updateCategoryStatus(categoryId, newStatus);
                    console.log('✅ Status updated successfully before category update');
                  } catch (statusError) {
                    console.error('❌ Failed to update status before category update:', statusError);
                    // Vẫn tiếp tục update category vì status có thể update sau
                  }
                }

                // Update: có thể sửa categoryCode, categoryName, departmentId, slaResolveHours
                const updatedCategory = await updateCategory(categoryId, {
                  categoryCode: categoryFormData.categoryCode,
                  categoryName: categoryFormData.categoryName,
                  departmentId: categoryFormData.departmentId,
                  slaResolveHours: categoryFormData.slaResolveHours,
                  // status không gửi trong update, dùng updateStatus riêng
                });

                // Nếu status chưa được update ở trên, update sau khi update category
                // (nhưng thường thì đã update ở trên rồi)
                if (oldStatus === newStatus && updatedCategory) {
                  console.log('📋 Status unchanged, no need to update status');
                }
              } else {
                // Create: chỉ gửi categoryCode, categoryName, departmentId, slaResolveHours (không gửi status)
                const createdCategory = await createCategory({
                  categoryCode: categoryFormData.categoryCode,
                  categoryName: categoryFormData.categoryName,
                  departmentId: categoryFormData.departmentId,
                  slaResolveHours: categoryFormData.slaResolveHours,
                  // status không gửi khi create (theo Swagger)
                });

                // Nếu status không phải ACTIVE, cần update status sau khi create
                if (categoryFormData.status !== 'ACTIVE') {
                  // Lấy categoryId từ response
                  if (createdCategory && typeof createdCategory.id === 'number') {
                    await updateCategoryStatus(createdCategory.id, categoryFormData.status);
                  } else {
                    // Fallback: load categories và tìm lại
                    await loadCategories();
                    const found = categories.find(c => c.categoryCode === categoryFormData.categoryCode);
                    if (found && typeof found.id === 'number') {
                      await updateCategoryStatus(found.id, categoryFormData.status);
                    }
                  }
                }
              }
              // Reload categories sau khi tạo/cập nhật
              await loadCategories();
              setIsFormOpen(false);
              setEditingCategory(null);
            } catch (error) {
              console.error('Error saving category:', error);
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi lưu category';
              alert(`❌ Lỗi: ${errorMessage}\n\nVui lòng:\n1. Kiểm tra console (F12) để xem chi tiết\n2. Kiểm tra backend API có đang chạy không\n3. Kiểm tra backend có hỗ trợ endpoint này không`);
            }
          }}
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
          onSubmit={async () => {
            try {
              if (editingDept) {
                // Validate form data trước khi update
                if (!deptFormData.deptCode || deptFormData.deptCode.trim().length === 0) {
                  alert('Vui lòng nhập mã bộ phận.');
                  return;
                }
                
                if (!deptFormData.deptName || deptFormData.deptName.trim().length === 0) {
                  alert('Vui lòng nhập tên bộ phận.');
                  return;
                }
                
                // Update: lấy departmentId (int32) từ editingDept
                let departmentId: number | null = null;
                
                if (typeof editingDept.id === 'number') {
                  departmentId = editingDept.id;
                } else if (typeof editingDept.id === 'string') {
                  const parsed = parseInt(editingDept.id, 10);
                  if (!isNaN(parsed) && parsed > 0) {
                    departmentId = parsed;
                  }
                }
                
                if (!departmentId || isNaN(departmentId) || departmentId <= 0) {
                  console.error('❌ Invalid departmentId:', editingDept.id, 'from editingDept:', editingDept);
                  alert(`Không thể xác định ID bộ phận (ID: ${editingDept.id}). Vui lòng thử lại hoặc reload trang.`);
                  return;
                }
                
                console.log('🏢 Updating department:', {
                  departmentId,
                  editingDept,
                  formData: deptFormData
                });
                
                // Cập nhật department: có thể sửa mã bộ phận, tên bộ phận và trạng thái
                // PUT /api/Department/{departmentId} để cập nhật deptCode và deptName
                // Nếu có status, sẽ tự động cập nhật status qua PATCH /api/Department/status
                await updateDepartment(departmentId, {
                  deptCode: deptFormData.deptCode.trim(), // Có thể sửa mã bộ phận
                  deptName: deptFormData.deptName.trim(), // Có thể sửa tên bộ phận
                  status: deptFormData.status,     // Có thể sửa trạng thái
                });
              } else {
                // Create: theo Swagger chỉ cần deptCode và deptName (không có status)
                await createDepartment({
                  deptCode: deptFormData.deptCode,
                  deptName: deptFormData.deptName,
                });
                
                // Nếu status không phải ACTIVE, update sau khi tạo
                if (deptFormData.status !== 'ACTIVE') {
                  // Reload để lấy id mới
                  await loadDepartments();
                  const newDept = departments.find(d => d.deptCode === deptFormData.deptCode);
                  if (newDept) {
                    const newDeptId = typeof newDept.id === 'number' 
                      ? newDept.id 
                      : (typeof newDept.id === 'string' ? parseInt(newDept.id, 10) : null);
                    if (newDeptId && !isNaN(newDeptId)) {
                      await updateDepartmentStatus(newDeptId, deptFormData.status);
                    }
                  }
                }
              }
              // Reload departments sau khi tạo/cập nhật
              await loadDepartments();
              setIsFormOpen(false);
              setEditingDept(null);
            } catch (error) {
              console.error('❌ Error saving department:', error);
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi lưu bộ phận';
              alert(`❌ Lỗi: ${errorMessage}\n\nVui lòng:\n1. Kiểm tra console (F12) để xem chi tiết\n2. Kiểm tra backend API có đang chạy không\n3. Kiểm tra backend có hỗ trợ endpoint này không`);
            }
          }}
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
          campuses={campuses}
          onFormDataChange={setLocationFormData as any}
          onSubmit={async () => {
            try {
              if (editingLocation) {
                // Update existing location
                // Lấy locationId (int32) từ editingLocation
                const locationId = typeof editingLocation.id === 'number' 
                  ? editingLocation.id 
                  : (typeof editingLocation.id === 'string' ? parseInt(editingLocation.id, 10) : null);
                
                if (!locationId || isNaN(locationId)) {
                  alert('Không thể xác định ID địa điểm. Vui lòng thử lại.');
                  return;
                }
                
                const newCode = locationFormData.code.trim();
                
                // Get campusId from selected campus
                let campusId: number | undefined;
                if (locationFormData.campusCode) {
                  const selectedCampus = campuses.find(c => c.campusCode === locationFormData.campusCode);
                  if (selectedCampus && selectedCampus.campusId) {
                    // Đảm bảo campusId là number
                    campusId = typeof selectedCampus.campusId === 'string' 
                      ? parseInt(selectedCampus.campusId, 10) 
                      : selectedCampus.campusId;
                  } else if (!selectedCampus) {
                    // Try to get from detail API
                    try {
                      const campusDetail = await campusService.getCampusByCode(locationFormData.campusCode);
                      if (campusDetail && campusDetail.campusId) {
                        campusId = typeof campusDetail.campusId === 'string' 
                          ? parseInt(campusDetail.campusId, 10) 
                          : campusDetail.campusId;
                      }
                    } catch (error) {
                      console.error('Error getting campus detail:', error);
                    }
                  }
                }
                
                if (!campusId) {
                  alert('Không thể lấy Campus ID. Vui lòng thử lại.');
                  return;
                }
                
                // Theo Swagger: PUT /api/Location/{locationId} có thể sửa cả locationCode
                // Không cần xóa và tạo mới, chỉ cần update
                await updateLocation(
                  locationId,
                  {
                    code: newCode, // Có thể sửa locationCode
                    name: locationFormData.name.trim(),
                    status: locationFormData.status,
                    campusId: campusId,
                  }
                );
              } else {
                // Create new location
                if (!locationFormData.campusCode) {
                  alert('Vui lòng chọn Campus');
                  return;
                }   
                
                // Get campusId from selected campusCode
                const selectedCampus = campuses.find(c => c.campusCode === locationFormData.campusCode);
                if (!selectedCampus) {
                  alert('Không tìm thấy Campus đã chọn. Vui lòng thử lại.');
                  console.error('⚠️ Selected campus not found:', locationFormData.campusCode);
                  return;
                }
                
                // Validate campusId from API response
                if (!selectedCampus.campusId) {
                  // Try to get from detail API as fallback
                  try {
                    const campusDetail = await campusService.getCampusByCode(locationFormData.campusCode);
                    if (campusDetail && campusDetail.campusId) {
                      selectedCampus.campusId = campusDetail.campusId;
                    }
                  } catch (error) {
                    console.error('Error getting campus detail:', error);
                  }
                  
                  // If still no campusId, show clear error
                  if (!selectedCampus.campusId) {
                    alert(
                      `❌ Không thể lấy Campus ID.\n\n` +
                      `Backend API /Campus cần trả về field "campusId" (số nguyên) trong response.\n\n` +
                      `Vui lòng yêu cầu backend cập nhật API theo tài liệu trong file:\n` +
                      `docs/BACKEND_API_REQUIREMENTS.md`
                    );
                    console.error('❌ Campus missing campusId:', selectedCampus);
                    console.error('❌ API /Campus response should include campusId field');
                    return;
                  }
                }
                
                // Đảm bảo campusId là number
                const campusId = typeof selectedCampus.campusId === 'string' 
                  ? parseInt(selectedCampus.campusId, 10) 
                  : selectedCampus.campusId;
                
                if (!campusId || isNaN(campusId)) {
                  alert('Không thể lấy Campus ID hợp lệ. Vui lòng thử lại.');
                  return;
                }
                
                console.log('📍 Form data before create:', locationFormData);
                console.log('📍 Selected campus:', selectedCampus);
                console.log('📍 Using campusId (type):', campusId, typeof campusId);
                
                // Create location với status từ form
                await createLocation({
                  code: locationFormData.code.trim(),
                  name: locationFormData.name.trim(),
                  campusId: campusId, // Đảm bảo là number
                  status: locationFormData.status, // Gửi status khi tạo
                });
              }
              
              // Reload locations sau khi tạo/cập nhật
              await loadLocations();
              setIsFormOpen(false);
              setEditingLocation(null);
            } catch (error) {
              console.error('Error saving location:', error);
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
          }}
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
          onFormDataChange={setStaffFormData as any}
          onSubmit={async () => {
            try {
              if (editingStaff) {
                // Update existing staff
                const userId = typeof editingStaff.id === 'number' ? editingStaff.id : parseInt(editingStaff.id.toString(), 10);
                await updateUser(userId, {
                  userCode: staffFormData.userCode, // Theo Swagger có thể sửa userCode
                  fullName: staffFormData.fullName,
                  email: staffFormData.username || staffFormData.email, // username chính là email
                  phoneNumber: staffFormData.phoneNumber || undefined,
                  role: staffFormData.role,
                  departmentId: staffFormData.departmentId ? (isNaN(parseInt(staffFormData.departmentId)) ? undefined : parseInt(staffFormData.departmentId)) : undefined,
                });
              } else {
                // Create new staff
                // Trong StaffForm, field "username" có label "Tên đăng nhập (Email) *", nên dùng username làm email
                await createUser({
                  userCode: staffFormData.userCode || staffFormData.username, // Use userCode hoặc username
                  fullName: staffFormData.fullName,
                  password: staffFormData.password,
                  email: staffFormData.username || staffFormData.email, // username chính là email
                  phoneNumber: staffFormData.phoneNumber || undefined, // Optional
                  role: staffFormData.role,
                  departmentId: staffFormData.departmentId ? (isNaN(parseInt(staffFormData.departmentId)) ? undefined : parseInt(staffFormData.departmentId)) : undefined,
                });
                
                setStaffPage(1);
              }
              
              // Reload users sau khi tạo/cập nhật
              await loadUsers();
              setIsFormOpen(false);
              setEditingStaff(null);
            } catch (error) {
              console.error('Error saving staff:', error);
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi lưu staff';
              alert(`❌ Lỗi: ${errorMessage}\n\nVui lòng:\n1. Kiểm tra console (F12) để xem chi tiết\n2. Kiểm tra backend API có đang chạy không`);
            }
          }}
          onResetPassword={editingStaff ? () => {
            // TODO: API không hỗ trợ update password qua PUT
            // Cần endpoint riêng để reset password
            alert('Tính năng reset password đang được phát triển.\nAPI hiện tại không hỗ trợ update password qua PUT /User/{userCode}');
          } : undefined}
          onToggleStatus={editingStaff ? async () => {
            try {
              // Lấy userId từ editingStaff
              let userId: number;
              if (typeof editingStaff.id === 'number') {
                userId = editingStaff.id;
              } else if (typeof editingStaff.id === 'string') {
                const parsed = parseInt(editingStaff.id, 10);
                if (isNaN(parsed) || parsed <= 0) {
                  const found = users.find(u => u.userCode === editingStaff.userCode);
                  if (found && typeof found.id === 'number') {
                    userId = found.id;
                  } else {
                    throw new Error('Không tìm thấy userId. Vui lòng reload trang và thử lại.');
                  }
                } else {
                  userId = parsed;
                }
              } else {
                const found = users.find(u => u.userCode === editingStaff.userCode);
                if (found && typeof found.id === 'number') {
                  userId = found.id;
                } else {
                  throw new Error('Không tìm thấy userId. Vui lòng reload trang và thử lại.');
                }
              }

              const newStatus = editingStaff.status === 'active' ? 'inactive' : 'active';
              await updateUserStatus(userId, newStatus);
              await loadUsers(); // Reload sau khi update
            } catch (error) {
              console.error('Error toggling staff status:', error);
              alert('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
          userTickets={editingUser ? getTicketsByUserId(typeof editingUser.id === 'number' ? editingUser.id.toString() : editingUser.id) : []}
          onFormDataChange={setUserFormData as any}
          onSubmit={async () => {
            try {
              if (editingUser) {
                // Update existing user
                const userId = typeof editingUser.id === 'number' ? editingUser.id : parseInt(editingUser.id.toString(), 10);
                await updateUser(userId, {
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
              
              // Reload users sau khi tạo/cập nhật
              await loadUsers();
              setIsFormOpen(false);
              setEditingUser(null);
            } catch (error) {
              console.error('Error saving user:', error);
              const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi lưu user';
              alert(`❌ Lỗi: ${errorMessage}\n\nVui lòng:\n1. Kiểm tra console (F12) để xem chi tiết\n2. Kiểm tra backend API có đang chạy không`);
            }
          }}
          onToggleBan={editingUser ? async () => {
            try {
              // Lấy userId từ editingUser
              let userId: number;
              if (typeof editingUser.id === 'number') {
                userId = editingUser.id;
              } else if (typeof editingUser.id === 'string') {
                const parsed = parseInt(editingUser.id, 10);
                if (isNaN(parsed) || parsed <= 0) {
                  const found = users.find(u => u.userCode === editingUser.userCode);
                  if (found && typeof found.id === 'number') {
                    userId = found.id;
                  } else {
                    throw new Error('Không tìm thấy userId. Vui lòng reload trang và thử lại.');
                  }
                } else {
                  userId = parsed;
                }
              } else {
                const found = users.find(u => u.userCode === editingUser.userCode);
                if (found && typeof found.id === 'number') {
                  userId = found.id;
                } else {
                  throw new Error('Không tìm thấy userId. Vui lòng reload trang và thử lại.');
                }
              }

              const newStatus = editingUser.status === 'active' ? 'banned' : 'active';
              await updateUserStatus(userId, newStatus);
              await loadUsers(); // Reload sau khi update
            } catch (error) {
              console.error('Error toggling user ban status:', error);
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
          categories={adminCategories}
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
