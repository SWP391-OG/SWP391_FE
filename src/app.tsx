import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, Department, Location, Category, Priority, IssueType, Ticket } from './types';
import { mockDepartments, mockLocations, mockCategories, mockTickets } from './data/mockData';
import { mockUsers } from './data/mockUsers';
import { 
  loadUsers, saveUsers, 
  loadCategories, saveCategories, 
  loadDepartments, saveDepartments, 
  loadLocations, saveLocations, 
  loadTickets, saveTickets 
} from './utils/localStorage';
import ITStaffPage from './pages/it-staff-page';
import FacilityStaffPage from './pages/facility-staff-page';

import IssueSelectionPage from './pages/issue-selection-page';
import CreateTicketPage from './pages/create-ticket-page';
import TicketListPage from './pages/ticket-list-page';
import TicketDetailModal from './components/ticket-detail-modal';
import LoginModal from './components/login-modal';
import RegisterModal from './components/register-modal';
import ForgotPasswordModal from './components/forgot-password-modal';
import ProfileModal from './components/profile-modal';

type StaffType = 'it' | 'facility';
type StudentView = 'home' | 'issue-selection' | 'create-ticket' | 'ticket-list';

function App() {
  // Login state (from dev branch)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Mock current user IDs (sẽ thay bằng authentication sau)
  const [currentAdminId] = useState<string>('admin-001'); // IT Admin - quản lý IT Department
  
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [staffType, setStaffType] = useState<StaffType>('it');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'departments' | 'locations' | 'tickets' | 'staff' | 'users'>('tickets');
  const [showMembersSubmenu, setShowMembersSubmenu] = useState(false);
  
  // Tự động mở submenu khi chọn staff hoặc users
  useEffect(() => {
    if (activeTab === 'staff' || activeTab === 'users') {
      setShowMembersSubmenu(true);
    }
  }, [activeTab]);
  
  // Initialize state from localStorage or mockData
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [departments, setDepartments] = useState<Department[]>(() => loadDepartments());
  const [locations, setLocations] = useState<Location[]>(() => loadLocations());
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);
  
  useEffect(() => {
    saveDepartments(departments);
  }, [departments]);
  
  useEffect(() => {
    saveLocations(locations);
  }, [locations]);
  
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);
  
  useEffect(() => {
    saveUsers(users);
  }, [users]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    floor: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [locationFilterFloor, setLocationFilterFloor] = useState<string>('all');
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
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  
  // Pagination state
  const [usersPage, setUsersPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const itemsPerPage = 10;
  
  // Student page state
  const [studentView, setStudentView] = useState<StudentView>('home');
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setShowStaffDropdown(false);
    setStudentView('home');
    setSelectedIssue(null);
    setSelectedTicket(null);
  };

  const handleStaffRoleChange = () => {
    // Set role based on staffType
    const role: UserRole = staffType === 'it' ? 'it-staff' : 'facility-staff';
    setCurrentRole(role);
    setShowStaffDropdown(false);
    setStudentView('home');
    setSelectedIssue(null);
    setSelectedTicket(null);
  };

  // Login handlers (from dev branch)
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setStudentView('home');
    setSelectedIssue(null);
    setSelectedTicket(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const getBadgeGradient = (role: UserRole) => {
    if (role === 'student') return 'from-blue-500 to-blue-600';
    if (role === 'it-staff' || role === 'facility-staff') return 'from-emerald-500 to-emerald-600';
    return 'from-amber-500 to-amber-600';
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'Sinh viên';
      case 'it-staff':
        return 'IT Staff';
      case 'facility-staff':
        return 'Facility Staff';
      case 'admin':
        return 'Department Admin';
      default:
        return role;
    }
  };

  // Filter departments by adminId - Admin chỉ thấy departments mình quản lý
  const adminDepartments = useMemo(() => {
    if (currentRole !== 'admin') return departments;
    return departments.filter(dept => dept.adminId === currentAdminId);
  }, [departments, currentAdminId, currentRole]);

  // Get department IDs that admin manages
  const adminDepartmentIds = useMemo(() => {
    return adminDepartments.map(dept => dept.id);
  }, [adminDepartments]);

  // Filter categories by admin's departments - Admin chỉ thấy categories thuộc departments mình quản lý
  const adminCategories = useMemo(() => {
    if (currentRole !== 'admin') return categories;
    return categories.filter(cat => adminDepartmentIds.includes(cat.departmentId));
  }, [categories, adminDepartmentIds, currentRole]);

  // Map IssueCategory to Category name for ticket filtering
  const categoryNameMap: Record<string, string[]> = {
    'wifi': ['WiFi/Mạng'],
    'equipment': ['Thiết bị'],
    'facility': ['Cơ sở vật chất', 'Điện nước', 'Khẩn cấp'],
    'classroom': ['Vệ sinh'],
    'other': ['Cơ sở vật chất', 'Vệ sinh'],
  };

  // Filter tickets by admin's departments (tickets with categories belonging to admin's departments)
  // Ẩn 'cancelled' tickets khỏi danh sách "Cần làm" nhưng vẫn lưu trong hệ thống
  const adminTickets = useMemo(() => {
    if (currentRole !== 'admin') return tickets;
    return tickets.filter(ticket => {
      // Ẩn cancelled tickets khỏi danh sách "Cần làm"
      if (ticket.status === 'cancelled') return false;
      
      // Find categories that match the ticket's IssueCategory
      const matchingCategoryNames = categoryNameMap[ticket.category] || [];
      const matchingCategories = categories.filter(cat => 
        matchingCategoryNames.includes(cat.name)
      );
      
      // Check if any matching category belongs to admin's departments
      return matchingCategories.some(cat => 
        adminDepartmentIds.includes(cat.departmentId)
      );
    });
  }, [tickets, categories, adminDepartmentIds, currentRole]);

  // Get staff list for admin's departments
  const adminStaffList = useMemo(() => {
    const staffMap = new Map<string, { id: string; name: string; departmentName: string }>();
    adminDepartments.forEach(dept => {
      dept.staffIds.forEach(staffId => {
        if (!staffMap.has(staffId)) {
          // Mock staff names (sẽ thay bằng API sau)
          const staffNames: Record<string, string> = {
            'staff-001': 'Lý Văn K',
            'staff-002': 'Bùi Thị H',
            'staff-003': 'Hoàng Văn E',
            'staff-004': 'Ngô Văn M',
            'staff-005': 'Trần Văn B',
          };
          staffMap.set(staffId, {
            id: staffId,
            name: staffNames[staffId] || staffId,
            departmentName: dept.name,
          });
        }
      });
    });
    return Array.from(staffMap.values());
  }, [adminDepartments]);

  // Filter staff users (it-staff, facility-staff) in admin's departments
  const adminStaffUsers = useMemo(() => {
    if (currentRole !== 'admin') return [];
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
        // Sắp xếp theo createdAt (mới nhất trước)
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime; // Mới nhất trước
      });
  }, [users, adminDepartments, currentRole]);
  
  // Paginated staff users
  const paginatedStaffUsers = useMemo(() => {
    const startIndex = (staffPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return adminStaffUsers.slice(startIndex, endIndex);
  }, [adminStaffUsers, staffPage]);
  
  const totalStaffPages = Math.ceil(adminStaffUsers.length / itemsPerPage);

  // Filter student users (chủ yếu là sinh viên)
  const studentUsers = useMemo(() => {
    if (currentRole !== 'admin') return [];
    return users
      .filter(user => user.role === 'student' || user.role === 'teacher')
      .sort((a, b) => {
        // Sắp xếp theo createdAt (mới nhất trước)
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime; // Mới nhất trước
      });
  }, [users, currentRole]);
  
  // Paginated student users
  const paginatedStudentUsers = useMemo(() => {
    const startIndex = (usersPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return studentUsers.slice(startIndex, endIndex);
  }, [studentUsers, usersPage]);
  
  const totalUsersPages = Math.ceil(studentUsers.length / itemsPerPage);

  // Get tickets created by a specific user
  const getUserTickets = (userId: string) => {
    return tickets.filter(ticket => ticket.createdBy === userId);
  };

  // Handle assign ticket to staff (Admin)
  const handleAssignTicket = (ticketId: string, staffId: string) => {
    const staff = adminStaffList.find(s => s.id === staffId);
    if (!staff) return;

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const newStatus = t.status === 'open' ? 'acknowledged' : t.status;
        return {
          ...t,
          assignedTo: staffId,
          assignedToName: staff.name,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  // Handle cancel ticket (Admin only - thay thế cho xóa)
  const handleCancelTicket = (ticketId: string) => {
    const reason = prompt('Lý do hủy ticket (ví dụ: Báo cáo sai, spam, không thuộc phạm vi xử lý):');
    if (reason === null) return; // User cancelled

    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          notes: t.notes ? `${t.notes}\n[Hủy bởi Admin]: ${reason}` : `[Hủy bởi Admin]: ${reason}`,
        };
      }
      return t;
    }));
  };

  // Handle update priority (Admin only)
  const handleUpdatePriority = (ticketId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          priority: newPriority,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  // Get current staff ID based on staffType
  const getCurrentStaffId = () => {
    if (staffType === 'it') return 'staff-001'; // IT Staff
    return 'staff-003'; // Facility Staff
  };

  // Helper function to check if role is staff
  const isStaffRole = (role: UserRole): boolean => {
    return role === 'it-staff' || role === 'facility-staff';
  };

  // Filter tickets assigned to current staff
  const staffTickets = useMemo(() => {
    if (!isStaffRole(currentRole)) return [];
    const staffId = getCurrentStaffId();
    return tickets.filter(ticket => ticket.assignedTo === staffId);
  }, [tickets, currentRole, staffType]);

  // Handle update ticket status (for Staff)
  const handleUpdateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/logoFPTechnical.jpg" 
              alt="FPTechnical Logo" 
              className="h-10 w-auto object-contain"
            />
    </div>
          <div className="flex gap-3">
            {/* Student Button */}
            <button
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                currentRole === 'student'
                  ? 'border-white bg-white text-orange-500'
                  : 'border-white/30 bg-white/10 hover:bg-white/20'
              }`}
              onClick={() => handleRoleChange('student')}
            >
              Student
            </button>

            {/* Staff Dropdown */}
            <div className="relative">
              <button
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all flex items-center gap-2 ${
                  isStaffRole(currentRole)
                    ? 'border-white bg-white text-orange-500'
                    : 'border-white/30 bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => {
                  if (isStaffRole(currentRole)) {
                    setShowStaffDropdown(!showStaffDropdown);
                  } else {
                    handleStaffRoleChange();
                    setShowStaffDropdown(true);
                  }
                }}
              >
                Staff {isStaffRole(currentRole) && `(${staffType === 'it' ? 'IT' : 'Facility'})`}
                <span className={`transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showStaffDropdown && isStaffRole(currentRole) && (
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
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
             {currentUser ? (
            <>
              <button
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="text-right">
                  <div className="text-sm font-semibold">{currentUser.fullName}</div>
                  <div className="text-xs opacity-80">Xem hồ sơ</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  {currentUser.role === 'student' ? '👨‍🎓' : 
                   currentUser.role === 'it-staff' ? '👨‍💻' : 
                   currentUser.role === 'facility-staff' ? '👨‍🔧' : '👨‍💼'}
                </div>
              </button>
              <button
                className="py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                className="py-2.5 px-6 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white bg-transparent text-white font-semibold hover:bg-white/10"
                onClick={() => setShowRegisterModal(true)}
              >
                📝 Đăng ký
              </button>
              <button
                className="py-2.5 px-6 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white bg-white text-orange-500 font-semibold hover:bg-white/90 shadow-lg"
                onClick={() => setShowLoginModal(true)}
              >
                🔐 Đăng nhập
              </button>
            </div>
          )}
          </div>

        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onShowRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
          onShowForgotPassword={() => {
            setShowLoginModal(false);
            setShowForgotPasswordModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onResetSuccess={() => {
            setShowForgotPasswordModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
        />
      )}

      {/* Content */}
      <div>
        {/* Student Page */}
        {currentRole === 'student' && (
          <div className="max-w-[1400px] mx-auto p-8">
            {studentView === 'home' && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    Student
                  </div>
                  <h2 className="text-2xl my-2 text-gray-800">Trang Sinh viên</h2>
                  <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
                    Bạn đang ở trang dành cho Sinh viên
                  </p>
                </div>
                <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
                  <div className="text-[5rem] mb-6">👨‍🎓</div>
                  <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho Sinh viên</h3>
                  <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto mb-8">
                    Sinh viên có thể gửi phản ánh về cơ sở vật chất, WiFi, thiết bị và theo dõi trạng thái xử lý.
                  </p>
                  <div>
                    <button
                      className="py-4 px-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_4px_8px_rgba(59,130,246,0.3)] mt-4 hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(59,130,246,0.4)]"
                      onClick={() => setStudentView('issue-selection')}
                    >
                      Tạo Ticket Mới
                    </button>
                    <button
                      className="py-4 px-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_4px_8px_rgba(16,185,129,0.3)] mt-4 ml-4 hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(16,185,129,0.4)]"
                      onClick={() => setStudentView('ticket-list')}
                    >
                      Xem Danh Sách Ticket
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {studentView === 'issue-selection' && (
              <IssueSelectionPage
                onSelectIssue={(issueType) => {
                  setSelectedIssue(issueType);
                  setStudentView('create-ticket');
                }}
                onBack={() => setStudentView('home')}
              />
            )}
            
            {studentView === 'create-ticket' && selectedIssue && (
              <CreateTicketPage
                issueType={selectedIssue}
                onBack={() => setStudentView('issue-selection')}
                onSubmit={(ticket) => {
                  // Handle ticket submission
                  console.log('Ticket submitted:', ticket);
                  alert('Ticket đã được gửi thành công! 🎉');
                  setStudentView('home');
                  setSelectedIssue(null);
                }}
              />
            )}
            
            {studentView === 'ticket-list' && (
              <TicketListPage
                onViewDetail={(ticket) => setSelectedTicket(ticket)}
                onBack={() => setStudentView('home')}
              />
            )}
            
            {/* Ticket Detail Modal */}
            {selectedTicket && (
              <TicketDetailModal
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
              />
            )}
          </div>
        )}


        {/* Staff Pages */}
        {isStaffRole(currentRole) && (
          <>
            {staffType === 'it' && (
              <ITStaffPage
                tickets={staffTickets}
                onUpdateStatus={handleUpdateTicketStatus}
                onViewDetail={(ticket) => setSelectedTicket(ticket)}
              />
            )}
            {staffType === 'facility' && (
              <FacilityStaffPage
                tickets={staffTickets}
                onUpdateStatus={handleUpdateTicketStatus}
                onViewDetail={(ticket) => setSelectedTicket(ticket)}
              />
            )}
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
                <div className="w-72 bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-8">
                  <h3 className="m-0 mb-6 text-base text-gray-900 font-semibold uppercase tracking-wide pb-4 border-b border-gray-200">
                    Quản lý hệ thống
                  </h3>
                  <nav className="flex flex-col gap-1">
                    {/* 1. Quản lý Tickets - Đầu tiên */}
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
                    
                    {/* 2. Quản lý thành viên - Với submenu */}
                    <div>
                      <button
                        className={`w-full py-2.5 px-4 rounded-md cursor-pointer text-sm text-left transition-all duration-200 flex items-center justify-between ${
                          (activeTab === 'staff' || activeTab === 'users')
                            ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-600'
                            : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setShowMembersSubmenu(!showMembersSubmenu)}
                      >
                        <span>Quản lý thành viên</span>
                        <span className={`transition-transform duration-200 text-xs ${showMembersSubmenu ? 'rotate-90' : ''}`}>
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
                    
                    {/* 3. Quản lý Danh mục */}
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
                    
                    {/* 4. Quản lý Bộ phận */}
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
                    
                    {/* 5. Quản lý Địa điểm */}
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
                  </nav>
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
                      Danh sách Category ({adminCategories.length})
                    </h3>
                    <button
                      style={{
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ea580c';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f97316';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
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
                      Thêm Category
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
                      {adminCategories.map((cat) => {
                        const deptName = adminDepartments.find(d => d.id === cat.departmentId)?.name || 'Unknown';
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
                              color: '#1f2937',
                              fontWeight: 600,
                            }}>
                              {cat.name}
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
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#9ca3af';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.borderColor = '#d1d5db';
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
                                  Sửa
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: '1px solid #dc2626',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    color: '#dc2626',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                  onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn xóa category này?')) {
                                      setCategories(categories.filter(c => c.id !== cat.id));
                                    }
                                  }}
                                  title="Xóa"
                                >
                                  Xóa
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
                      Danh sách Bộ phận ({adminDepartments.length})
                    </h3>
                    <button
                      style={{
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      onClick={() => {
                        setEditingDept(null);
                        setDeptFormData({ name: '', description: '', location: '', adminId: '', staffIds: [] });
                        setIsFormOpen(true);
                      }}
                    >
                      Thêm Bộ phận
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
                        }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminDepartments.map((dept) => (
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
                          }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                style={{
                                  background: 'none',
                                  border: '1px solid #d1d5db',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  color: '#374151',
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f3f4f6';
                                  e.currentTarget.style.borderColor = '#9ca3af';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'none';
                                  e.currentTarget.style.borderColor = '#d1d5db';
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
                                Sửa
                              </button>
                              <button
                                style={{
                                  background: 'none',
                                  border: '1px solid #dc2626',
                                  fontSize: '0.875rem',
                                  cursor: 'pointer',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  color: '#dc2626',
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fee2e2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'none';
                                }}
                                onClick={() => {
                                  if (confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) {
                                    setDepartments(departments.filter(d => d.id !== dept.id));
                                    // Locations không còn liên kết với department
                                  }
                                }}
                                title="Xóa"
                              >
                                Xóa
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
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      onClick={() => {
                        setEditingLocation(null);
                        setLocationFormData({
                          name: '',
                          description: '',
                          type: 'classroom',
                          floor: '',
                          status: 'active',
                        });
                        setIsFormOpen(true);
                      }}
                    >
                      Thêm Địa điểm
                    </button>
                  </div>

                  {/* Filter by Floor */}
                  <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                    }}>
                      Chọn Tầng:
                    </label>
                    <select
                      value={locationFilterFloor}
                      onChange={(e) => setLocationFilterFloor(e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        background: 'white',
                        minWidth: '150px',
                      }}
                    >
                      <option value="all">Tất cả các tầng</option>
                      <option value="G">Tầng Trệt (G)</option>
                      <option value="1">Tầng 1</option>
                      <option value="2">Tầng 2</option>
                      <option value="3">Tầng 3</option>
                      <option value="4">Tầng 4</option>
                      <option value="5">Tầng 5</option>
                      <option value="6">Tầng 6</option>
                    </select>
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
                        }}>Tầng</th>
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
                      {locations
                        .filter((location) => {
                          if (locationFilterFloor === 'all') return true;
                          return location.floor === locationFilterFloor;
                        })
                        .map((location) => {
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

                        // Format floor display
                        const formatFloor = (floor?: string) => {
                          if (!floor) return '-';
                          if (floor === 'G') return 'Tầng Trệt (G)';
                          return `Tầng ${floor}`;
                        };

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
                              fontWeight: 500,
                            }}>{formatFloor(location.floor)}</td>
                            <td style={{
                              padding: '1rem',
                              borderBottom: '1px solid #e5e7eb',
                              color: '#4b5563',
                            }}>
                              {typeInfo.text}
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
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.borderColor = '#9ca3af';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                  }}
                                  onClick={() => {
                                    setEditingLocation(location);
                                    setLocationFormData({
                                      name: location.name,
                                      description: location.description || '',
                                      type: location.type,
                                      floor: location.floor || '',
                                      status: location.status,
                                    });
                                    setIsFormOpen(true);
                                  }}
                                  title="Chỉnh sửa"
                                >
                                  Sửa
                                </button>
                                <button
                                  style={{
                                    background: 'none',
                                    border: '1px solid #dc2626',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    color: '#dc2626',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                  onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) {
                                      setLocations(locations.filter(l => l.id !== location.id));
                                    }
                                  }}
                                  title="Xóa"
                                >
                                  Xóa
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

              {/* Tickets Management */}
              {activeTab === 'tickets' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Tickets ({adminTickets.length})
                    </h3>
                  </div>

                  {/* Tickets Table */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>ID</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Tiêu đề & Mô tả</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Vị trí</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Trạng thái</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Độ ưu tiên</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Người xử lý</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Ngày tạo</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminTickets.length > 0 ? (
                        adminTickets.map((ticket) => {
                          const statusInfo = {
                            open: { bg: '#dbeafe', color: '#1e40af', text: 'Mới tạo' },
                            'acknowledged': { bg: '#e0e7ff', color: '#3730a3', text: 'Đã giao việc' },
                            'in-progress': { bg: '#fef3c7', color: '#92400e', text: 'Đang xử lý' },
                            resolved: { bg: '#d1fae5', color: '#065f46', text: 'Đã giải quyết' },
                            closed: { bg: '#f3f4f6', color: '#374151', text: 'Đã đóng' },
                            cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'Đã hủy' },
                          }[ticket.status] || { bg: '#f3f4f6', color: '#374151', text: ticket.status };

                          const priorityInfo = {
                            low: { bg: '#d1fae5', color: '#065f46', text: 'Thấp' },
                            medium: { bg: '#fef3c7', color: '#92400e', text: 'Trung bình' },
                            high: { bg: '#fed7aa', color: '#9a3412', text: 'Cao' },
                            urgent: { bg: '#fee2e2', color: '#991b1b', text: 'Khẩn cấp' },
                          }[ticket.priority];

                          // Format date
                          const formatDate = (dateString: string) => {
                            const date = new Date(dateString);
                            return new Intl.DateTimeFormat('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(date);
                          };

                          // Get location name
                          const location = locations.find(l => l.id === ticket.location);
                          const locationName = location ? location.name : ticket.location || 'N/A';

                          // Get assigned staff name
                          const assignedStaff = adminStaffList.find(s => s.id === ticket.assignedTo);

                          return (
                            <tr key={ticket.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              {/* ID */}
                              <td style={{
                                padding: '0.875rem 1rem',
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                              }}>
                                {ticket.id.substring(0, 8)}
                              </td>
                              
                              {/* Tiêu đề & Mô tả */}
                              <td style={{
                                padding: '0.875rem 1rem',
                                color: '#1f2937',
                                maxWidth: '300px',
                              }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                  {ticket.title}
                                </div>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#6b7280', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis', 
                                  whiteSpace: 'nowrap',
                                  maxWidth: '280px',
                                }}>
                                  {ticket.description}
                                </div>
                              </td>
                              
                              {/* Vị trí */}
                              <td style={{
                                padding: '0.875rem 1rem',
                                color: '#4b5563',
                                fontSize: '0.875rem',
                              }}>
                                {locationName}
                              </td>
                              
                              {/* Trạng thái */}
                              <td style={{
                                padding: '0.875rem 1rem',
                              }}>
                                <span style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: statusInfo.bg,
                                  color: statusInfo.color,
                                  display: 'inline-block',
                                }}>
                                  {statusInfo.text}
                                </span>
                              </td>
                              
                              {/* Độ ưu tiên */}
                              <td style={{
                                padding: '0.875rem 1rem',
                              }}>
                                <span style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: priorityInfo.bg,
                                  color: priorityInfo.color,
                                  display: 'inline-block',
                                }}>
                                  {priorityInfo.text}
                                </span>
                              </td>
                              
                              {/* Người xử lý */}
                              <td style={{
                                padding: '0.875rem 1rem',
                                color: '#4b5563',
                                fontSize: '0.875rem',
                              }}>
                                {ticket.assignedTo && assignedStaff ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{assignedStaff.name}</span>
                                    <select
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        background: 'white',
                                        color: '#6b7280',
                                      }}
                                      value={ticket.assignedTo}
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          handleAssignTicket(ticket.id, e.target.value);
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {adminStaffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                          {staff.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <button
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      border: '1px solid #f97316',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      background: 'white',
                                      color: '#f97316',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (adminStaffList.length > 0) {
                                        const firstStaff = adminStaffList[0];
                                        handleAssignTicket(ticket.id, firstStaff.id);
                                      }
                                    }}
                                    title="Giao việc"
                                  >
                                    Assign +
                                  </button>
                                )}
                              </td>
                              
                              {/* Ngày tạo */}
                              <td style={{
                                padding: '0.875rem 1rem',
                                color: '#6b7280',
                                fontSize: '0.75rem',
                              }}>
                                {formatDate(ticket.createdAt)}
                              </td>
                              
                              {/* Hành động */}
                              <td style={{
                                padding: '0.875rem 1rem',
                              }}>
                                <button
                                  style={{
                                    background: '#f97316',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: 'white',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#ea580c';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f97316';
                                  }}
                                  onClick={() => {
                                    setSelectedTicket(ticket);
                                  }}
                                  title="Xem chi tiết"
                                >
                                  Xem
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#6b7280',
                          }}>
                            Không có ticket nào trong department của bạn
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}

              {/* Staff Management */}
              {activeTab === 'staff' && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Staff ({adminStaffUsers.length})
                    </h3>
                    <button
                      style={{
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      }}
                      onClick={() => {
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
                    >
                      Thêm Staff
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
                        }}>Tên đăng nhập</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Họ tên</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Email</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          borderBottom: '2px solid #e5e7eb',
                        }}>Vai trò</th>
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
                      {adminStaffUsers.length > 0 ? (
                        paginatedStaffUsers.map((staff: User) => {
                          const dept = adminDepartments.find(d => d.staffIds.includes(staff.id));
                          const roleInfoMap: Record<string, { text: string; bg: string; color: string }> = {
                            'it-staff': { text: 'IT Staff', bg: '#dbeafe', color: '#1e40af' },
                            'facility-staff': { text: 'Facility Staff', bg: '#fef3c7', color: '#92400e' },
                          };
                          const roleInfo = roleInfoMap[staff.role] || { text: staff.role, bg: '#f3f4f6', color: '#374151' };
                          const statusInfoMap: Record<string, { text: string; bg: string; color: string }> = {
                            'active': { text: 'Hoạt động', bg: '#d1fae5', color: '#065f46' },
                            'inactive': { text: 'Ngừng hoạt động', bg: '#fee2e2', color: '#991b1b' },
                            'banned': { text: 'Bị khóa', bg: '#fee2e2', color: '#991b1b' },
                          };
                          const statusInfo = statusInfoMap[staff.status] || { text: staff.status, bg: '#f3f4f6', color: '#374151' };

                          return (
                            <tr key={staff.id}>
                              <td style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#1f2937',
                                fontWeight: 600,
                              }}>{staff.username}</td>
                              <td style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#1f2937',
                              }}>{staff.fullName}</td>
                              <td style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#4b5563',
                              }}>{staff.email}</td>
                              <td style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                              }}>
                                <span style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: '6px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  background: roleInfo.bg,
                                  color: roleInfo.color,
                                }}>
                                  {roleInfo.text}
                                </span>
                              </td>
                              <td style={{
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#4b5563',
                              }}>{dept?.name || '-'}</td>
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
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    style={{
                                      background: 'none',
                                      border: '1px solid #d1d5db',
                                      fontSize: '0.875rem',
                                      cursor: 'pointer',
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '6px',
                                      color: '#374151',
                                      fontWeight: 500,
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#f3f4f6';
                                      e.currentTarget.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'none';
                                      e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                    onClick={() => {
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
                                    title="Chỉnh sửa"
                                  >
                                    Sửa
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
                                      const newPassword = prompt('Nhập mật khẩu mới:');
                                      if (newPassword && newPassword.trim()) {
                                        setUsers(users.map(u => 
                                          u.id === staff.id ? { ...u, password: newPassword.trim() } : u
                                        ));
                                        alert('Đã cấp lại mật khẩu thành công!');
                                      }
                                    }}
                                    title="Cấp lại mật khẩu"
                                  >
                                    🔑
                                  </button>
                                  {staff.status === 'active' ? (
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
                                        if (confirm('Bạn có chắc chắn muốn vô hiệu hóa staff này? Staff sẽ không thể đăng nhập nữa.')) {
                                          setUsers(users.map(u => 
                                            u.id === staff.id ? { ...u, status: 'inactive' as const } : u
                                          ));
                                        }
                                      }}
                                      title="Vô hiệu hóa"
                                    >
                                      🚫
                                    </button>
                                  ) : (
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
                                        if (confirm('Bạn có chắc chắn muốn kích hoạt lại staff này?')) {
                                          setUsers(users.map(u => 
                                            u.id === staff.id ? { ...u, status: 'active' as const } : u
                                          ));
                                        }
                                      }}
                                      title="Kích hoạt lại"
                                    >
                                      ✅
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#6b7280',
                          }}>
                            Chưa có staff nào trong departments của bạn
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              )}

              {/* Users Management */}
              {activeTab === 'users' && (
                <>
                  <div style={{
                    marginBottom: '1.5rem',
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                      Danh sách Người dùng ({studentUsers.length})
                    </h3>
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
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Mã SV</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Họ tên</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Email</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Trạng thái</th>
                        <th style={{
                          background: '#f9fafb',
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6b7280',
                          borderBottom: '1px solid #e5e7eb',
                        }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentUsers.length > 0 ? (
                        paginatedStudentUsers.map((user: User) => {
                          return (
                            <tr key={user.id}>
                              <td style={{
                                padding: '0.875rem 1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#1f2937',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                              }}>{user.username}</td>
                              <td style={{
                                padding: '0.875rem 1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#1f2937',
                                fontSize: '0.875rem',
                              }}>{user.fullName}</td>
                              <td style={{
                                padding: '0.875rem 1rem',
                                borderBottom: '1px solid #e5e7eb',
                                color: '#4b5563',
                                fontSize: '0.875rem',
                              }}>{user.email}</td>
                              <td style={{
                                padding: '0.875rem 1rem',
                                borderBottom: '1px solid #e5e7eb',
                                fontSize: '0.875rem',
                              }}>
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}>
                                  <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: user.status === 'active' ? '#10b981' : '#ef4444',
                                  }}></div>
                                  <span style={{
                                    color: user.status === 'active' ? '#10b981' : '#ef4444',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                  }}>
                                    {user.status === 'active' ? 'Hoạt động' : user.status === 'banned' ? 'Bị khóa' : 'Ngừng hoạt động'}
                                  </span>
                                </div>
                              </td>
                              <td style={{
                                padding: '0.875rem 1rem',
                                borderBottom: '1px solid #e5e7eb',
                              }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    style={{
                                      background: 'none',
                                      border: '1px solid #3b82f6',
                                      fontSize: '0.875rem',
                                      cursor: 'pointer',
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '6px',
                                      color: '#3b82f6',
                                      fontWeight: 500,
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dbeafe';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'none';
                                    }}
                                    onClick={() => {
                                      setSelectedUserForHistory(user);
                                    }}
                                    title="Xem lịch sử ticket"
                                  >
                                    Lịch sử
                                  </button>
                                  {user.status === 'active' ? (
                                    <button
                                      style={{
                                        background: 'none',
                                        border: '1px solid #dc2626',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        color: '#dc2626',
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#fee2e2';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'none';
                                      }}
                                      onClick={() => {
                                        if (confirm('Bạn có chắc chắn muốn khóa tài khoản sinh viên này? Sinh viên sẽ không thể đăng nhập hoặc gửi yêu cầu mới.')) {
                                          setUsers(users.map(u => 
                                            u.id === user.id ? { ...u, status: 'banned' as const } : u
                                          ));
                                        }
                                      }}
                                      title="Khóa tài khoản (Ban)"
                                    >
                                      Khóa
                                    </button>
                                  ) : user.status === 'banned' ? (
                                    <button
                                      style={{
                                        background: 'none',
                                        border: '1px solid #10b981',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        color: '#10b981',
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#d1fae5';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'none';
                                      }}
                                      onClick={() => {
                                        if (confirm('Bạn có chắc chắn muốn mở khóa tài khoản sinh viên này?')) {
                                          setUsers(users.map(u => 
                                            u.id === user.id ? { ...u, status: 'active' as const } : u
                                          ));
                                        }
                                      }}
                                      title="Mở khóa (Unban)"
                                    >
                                      Mở khóa
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                          }}>
                            Chưa có người dùng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Pagination for Users */}
                  {totalUsersPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1.5rem',
                    }}>
                      <button
                        onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                        disabled={usersPage === 1}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: usersPage === 1 ? '#f3f4f6' : 'white',
                          color: usersPage === 1 ? '#9ca3af' : '#374151',
                          cursor: usersPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        Trước
                      </button>
                      <span style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                      }}>
                        Trang {usersPage} / {totalUsersPages}
                      </span>
                      <button
                        onClick={() => setUsersPage(prev => Math.min(totalUsersPages, prev + 1))}
                        disabled={usersPage === totalUsersPages}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: usersPage === totalUsersPages ? '#f3f4f6' : 'white',
                          color: usersPage === totalUsersPages ? '#9ca3af' : '#374151',
                          cursor: usersPage === totalUsersPages ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </>
              )}
                </div>
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
                        {adminDepartments.map((dept) => (
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
                        <option value="classroom">Phòng học</option>
                        <option value="wc">Nhà vệ sinh</option>
                        <option value="hall">Sảnh</option>
                        <option value="corridor">Hành lang</option>
                        <option value="other">Khác</option>
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
                        Tầng *
                      </label>
                      <select
                        required
                        value={locationFormData.floor}
                        onChange={(e) => setLocationFormData({ ...locationFormData, floor: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="">Chọn tầng</option>
                        <option value="G">Tầng Trệt (G)</option>
                        <option value="1">Tầng 1</option>
                        <option value="2">Tầng 2</option>
                        <option value="3">Tầng 3</option>
                        <option value="4">Tầng 4</option>
                        <option value="5">Tầng 5</option>
                        <option value="6">Tầng 6</option>
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

            {/* Modal Form for Staff */}
            {isFormOpen && activeTab === 'staff' && (
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
                }}
                onClick={() => setIsFormOpen(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
                    {editingStaff ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingStaff) {
                        // Update staff
                        const updatedStaff: User = {
                          ...editingStaff,
                          username: staffFormData.username,
                          password: staffFormData.password,
                          fullName: staffFormData.fullName,
                          email: staffFormData.email,
                          role: staffFormData.role,
                        };
                        setUsers(users.map(u => u.id === editingStaff.id ? updatedStaff : u));
                        
                        // Update department's staffIds if department changed
                        const oldDept = adminDepartments.find(d => d.staffIds.includes(editingStaff.id));
                        if (oldDept && oldDept.id !== staffFormData.departmentId) {
                          setDepartments(departments.map(d => {
                            if (d.id === oldDept.id) {
                              return { ...d, staffIds: d.staffIds.filter(id => id !== editingStaff.id) };
                            }
                            if (d.id === staffFormData.departmentId) {
                              return { ...d, staffIds: [...d.staffIds, editingStaff.id] };
                            }
                            return d;
                          }));
                        }
                      } else {
                        // Create new staff
                        const newStaff: User = {
                          id: `staff-${Date.now()}`,
                          username: staffFormData.username,
                          password: staffFormData.password,
                          fullName: staffFormData.fullName,
                          email: staffFormData.email,
                          role: staffFormData.role,
                          status: 'active',
                          createdAt: new Date().toISOString(),
                        };
                        setUsers([...users, newStaff]);
                        setStaffPage(1); // Reset to first page
                        
                        // Add to department's staffIds
                        if (staffFormData.departmentId) {
                          setDepartments(departments.map(d => {
                            if (d.id === staffFormData.departmentId) {
                              return { ...d, staffIds: [...d.staffIds, newStaff.id] };
                            }
                            return d;
                          }));
                        }
                      }
                      setIsFormOpen(false);
                      setEditingStaff(null);
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
                        Tên đăng nhập *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffFormData.username}
                        onChange={(e) => setStaffFormData({ ...staffFormData, username: e.target.value })}
                        placeholder="VD: itstaff01"
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
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={staffFormData.password}
                        onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                        placeholder="Nhập mật khẩu"
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
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffFormData.fullName}
                        onChange={(e) => setStaffFormData({ ...staffFormData, fullName: e.target.value })}
                        placeholder="VD: Nguyễn Văn A"
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
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={staffFormData.email}
                        onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                        placeholder="VD: staff@fpt.edu.vn"
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
                        Vai trò *
                      </label>
                      <select
                        required
                        value={staffFormData.role}
                        onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as UserRole })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="it-staff">IT Staff</option>
                        <option value="facility-staff">Facility Staff</option>
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
                        Bộ phận *
                      </label>
                      <select
                        required
                        value={staffFormData.departmentId}
                        onChange={(e) => setStaffFormData({ ...staffFormData, departmentId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="">Chọn bộ phận</option>
                        {adminDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingStaff(null);
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          background: 'white',
                          color: '#374151',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {editingStaff ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Form for Users */}
            {isFormOpen && activeTab === 'users' && (
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
                }}
                onClick={() => setIsFormOpen(false)}
              >
                <div
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>
                    {editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingUser) {
                        // Update user
                        setUsers(users.map(u => u.id === editingUser.id ? {
                          ...u,
                          username: userFormData.username,
                          password: userFormData.password,
                          fullName: userFormData.fullName,
                          email: userFormData.email,
                          role: userFormData.role,
                        } : u));
                      } else {
                        // Create new user
                        const newUser: User = {
                          id: `user-${Date.now()}`,
                          username: userFormData.username,
                          password: userFormData.password,
                          fullName: userFormData.fullName,
                          email: userFormData.email,
                          role: userFormData.role,
                          status: 'active',
                        };
                        setUsers([...users, newUser]);
                      }
                      setIsFormOpen(false);
                      setEditingUser(null);
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
                        Tên đăng nhập *
                      </label>
                      <input
                        type="text"
                        required
                        value={userFormData.username}
                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                        placeholder="VD: student01"
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
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        placeholder="Nhập mật khẩu"
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
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={userFormData.fullName}
                        onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                        placeholder="VD: Nguyễn Văn A"
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
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="VD: student@fpt.edu.vn"
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
                        Vai trò *
                      </label>
                      <select
                        required
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      >
                        <option value="student">Sinh viên</option>
                        <option value="teacher">Giảng viên</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(false);
                          setEditingUser(null);
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          background: 'white',
                          color: '#374151',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #f97316, #ea580c)',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {editingUser ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ticket Detail Modal for Admin and Staff */}
        {(currentRole === 'admin' || isStaffRole(currentRole)) && selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;

