import { useState } from 'react';
import type { UserRole, IssueType, Ticket } from './types';
import IssueSelectionPage from './pages/issue-selection-page';
import CreateTicketPage from './pages/create-ticket-page';
import TicketListPage from './pages/ticket-list-page';
import TicketDetailModal from './components/ticket-detail-modal';

type StudentView = 'home' | 'issue-selection' | 'create-ticket' | 'ticket-list';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [studentView, setStudentView] = useState<StudentView>('home');
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setStudentView('home');
    setSelectedIssue(null);
    setSelectedTicket(null);
  };

  const getBadgeGradient = (role: UserRole) => {
    if (role === 'student') return 'from-blue-500 to-blue-600';
    if (role === 'staff') return 'from-emerald-500 to-emerald-600';
    return 'from-amber-500 to-amber-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-4 px-8 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <h1 className="m-0 text-[1.8rem] font-bold text-white">FPTInsight</h1>
          <p className="mt-1 mb-0 text-[0.85rem] opacity-90 font-normal">Facility Feedback & Helpdesk System</p>
        </div>
        <div className="flex gap-3">
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
          <button
            className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
              currentRole === 'staff'
                ? 'border-2 border-white bg-white text-orange-500 font-semibold'
                : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
            }`}
            onClick={() => handleRoleChange('staff')}
          >
            Staff
          </button>
          <button
            className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
              currentRole === 'admin'
                ? 'border-2 border-white bg-white text-orange-500 font-semibold'
                : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
            }`}
            onClick={() => handleRoleChange('admin')}
          >
            Department Admin
          </button>
        </div>
      </nav>

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

        {/* Staff Page */}
        {currentRole === 'staff' && (
          <>
            <div className="mb-8 text-center">
              <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide bg-gradient-to-br ${getBadgeGradient('staff')} text-white`}>
                Staff
              </div>
              <h2 className="text-2xl my-2 text-gray-800">Trang Nhân viên</h2>
              <p className="text-base text-gray-500 max-w-3xl mx-auto my-2 leading-relaxed">
                Bạn đang ở trang dành cho Nhân viên
              </p>
            </div>
            <div className="bg-white rounded-xl py-12 px-8 text-center shadow-sm max-w-[700px] mx-auto my-8 border-2 border-gray-100">
              <div className="text-[5rem] mb-6">👨‍💼</div>
              <h3 className="text-[1.75rem] text-gray-800 mb-4 font-bold">Chức năng dành cho Nhân viên</h3>
              <p className="text-gray-500 text-lg leading-[1.8] max-w-[500px] mx-auto">
                Nhân viên có thể tiếp nhận, xử lý và cập nhật trạng thái các ticket theo SLA.
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
