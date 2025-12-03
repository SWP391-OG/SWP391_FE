import { useState } from 'react';
import type { UserRole, IssueType, Ticket, User } from './types';
import IssueSelectionPage from './pages/issue-selection-page';
import CreateTicketPage from './pages/create-ticket-page';
import TicketListPage from './pages/ticket-list-page';
import TicketDetailModal from './components/ticket-detail-modal';
import LoginModal from './components/login-modal';

type StudentView = 'home' | 'issue-selection' | 'create-ticket' | 'ticket-list';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [studentView, setStudentView] = useState<StudentView>('home');
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setStudentView('home');
    setSelectedIssue(null);
    setSelectedTicket(null);
    setShowStaffDropdown(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-4 px-8 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <h1 className="m-0 text-[1.8rem] font-bold text-white">FPTInsight</h1>
          <p className="mt-1 mb-0 text-[0.85rem] opacity-90 font-normal">Facility Feedback & Helpdesk System</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
              currentRole === 'student'
                ? 'border-2 border-white bg-white text-orange-500 font-semibold'
                : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
            }`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
          
          {/* Staff Dropdown */}
          <div className="relative">
            <button
              className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 flex items-center gap-2 ${
                currentRole === 'it-staff' || currentRole === 'facility-staff'
                  ? 'border-2 border-white bg-white text-orange-500 font-semibold'
                  : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
              }`}
              onClick={() => setShowStaffDropdown(!showStaffDropdown)}
            >
              Staff
              <span className={`transition-transform duration-200 ${showStaffDropdown ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showStaffDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowStaffDropdown(false)}
                />
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg overflow-hidden min-w-[180px] z-20">
                  <button
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      currentRole === 'it-staff'
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleRoleChange('it-staff')}
                  >
                    <div className="flex items-center gap-2">
                      <span>👨‍💻</span>
                      <span>IT Staff</span>
                    </div>
                  </button>
                  <button
                    className={`w-full text-left px-4 py-3 transition-colors border-t border-gray-100 ${
                      currentRole === 'facility-staff'
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleRoleChange('facility-staff')}
                  >
                    <div className="flex items-center gap-2">
                      <span>👨‍🔧</span>
                      <span>Facility Staff</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          
          <button
            className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
              currentRole === 'admin'
                ? 'border-2 border-white bg-white text-orange-500 font-semibold'
                : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
            }`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </button>
          
          <div className="w-px h-8 bg-white/30 mx-1"></div>
          
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
                <div className="text-right">
                  <div className="text-sm font-semibold">{currentUser.fullName}</div>
                  <div className="text-xs opacity-80">{currentUser.email}</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  {currentUser.role === 'student' ? '👨‍🎓' : 
                   currentUser.role === 'it-staff' ? '👨‍💻' : 
                   currentUser.role === 'facility-staff' ? '👨‍🔧' : '👨‍💼'}
                </div>
              </div>
              <button
                className="py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              className="py-2.5 px-6 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white bg-white text-orange-500 font-semibold hover:bg-white/90 shadow-lg"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Đăng nhập
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Content */}
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Student Page */}
        {currentRole === 'student' && (
          <>
            {studentView === 'home' && (
              <>
                <div className="mb-8 text-center">
                  <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br ${getBadgeGradient('student')} text-white`}>
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
                      ➕ Tạo Ticket Mới
                    </button>
                    <button
                      className="py-4 px-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-200 shadow-[0_4px_8px_rgba(16,185,129,0.3)] mt-4 ml-4 hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(16,185,129,0.4)]"
                      onClick={() => setStudentView('ticket-list')}
                    >
                      📋 Xem Danh Sách Ticket
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
          </>
        )}
        
        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        {/* IT Staff Page */}
        {currentRole === 'it-staff' && (
          <>
            <div className="mb-8 text-center">
              <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br ${getBadgeGradient('it-staff')} text-white`}>
                IT Staff
              </div>
              <h2 className="text-2xl my-2 text-gray-800">Trang IT Staff</h2>
              <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
                Bạn đang ở trang dành cho IT Staff
              </p>
            </div>
            <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
              <div className="text-[5rem] mb-6">👨‍💻</div>
              <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho IT Staff</h3>
              <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto">
                IT Staff có thể tiếp nhận và xử lý các ticket liên quan đến WiFi, thiết bị IT và hệ thống công nghệ.
              </p>
            </div>
          </>
        )}

        {/* Facility Staff Page */}
        {currentRole === 'facility-staff' && (
          <>
            <div className="mb-8 text-center">
              <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br ${getBadgeGradient('facility-staff')} text-white`}>
                Facility Staff
              </div>
              <h2 className="text-2xl my-2 text-gray-800">Trang Facility Staff</h2>
              <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
                Bạn đang ở trang dành cho Facility Staff
              </p>
            </div>
            <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
              <div className="text-[5rem] mb-6">👨‍🔧</div>
              <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho Facility Staff</h3>
              <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto">
                Facility Staff có thể tiếp nhận và xử lý các ticket liên quan đến cơ sở vật chất, phòng học và thiết bị.
              </p>
            </div>
          </>
        )}

        {/* Admin Page */}
        {currentRole === 'admin' && (
          <>
            <div className="mb-8 text-center">
              <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br ${getBadgeGradient('admin')} text-white`}>
                Department Admin
              </div>
              <h2 className="text-2xl my-2 text-gray-800">Admin Dashboard</h2>
              <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
                Chào mừng quản trị viên! Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động.
              </p>
            </div>
            <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
              <div className="text-[5rem] mb-6">👨‍💼</div>
              <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho Admin</h3>
              <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto">
                Quản trị viên có quyền quản lý CRUD phòng/bộ phận, cấu hình hệ thống và giám sát toàn bộ hoạt động.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
