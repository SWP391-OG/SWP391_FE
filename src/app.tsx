import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, IssueType, Ticket } from './types';
import { 
  loadTickets, saveTickets 
} from './utils/localStorage';
import ITStaffPage from './pages/staff/it-staff-page';
import FacilityStaffPage from './pages/staff/facility-staff-page';
import AdminPage from './pages/admin/admin-page';
import StudentHomePage from './pages/student/student-home-page';
import TicketDetailModal from './components/shared/ticket-detail-modal';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ForgotPasswordPage from './pages/auth/forgot-password-page';
import ProfileModal from './components/shared/profile-modal';
import NavbarNew from './components/shared/navbar-new';

type StaffType = 'it' | 'facility';

function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Mock current user IDs (sẽ thay bằng authentication sau)
  const [currentAdminId] = useState<string>('admin-001'); // IT Admin - quản lý IT Department
  
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [staffType, setStaffType] = useState<StaffType>('it');
  
  // Initialize tickets state from localStorage
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  
  // Save tickets to localStorage whenever data changes
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);
  
  // Student page state - REMOVED, now handled in StudentHomePage
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);


  // Login handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    // Set staffType based on role
    if (user.role === 'it-staff') {
      setStaffType('it');
    } else if (user.role === 'facility-staff') {
      setStaffType('facility');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('admin'); // Reset role
    setAuthView('login'); // Return to login page
  };

  // Handle logo click - navigate to home based on role
  const handleLogoClick = () => {
    if (!currentUser) return;
    // Role is already set based on currentUser.role
    // The home page will be displayed based on currentRole
    // For student: already on student home
    // For staff: already on staff dashboard
    // For admin: already on admin dashboard
    // No action needed as the page is already showing the correct home
  };

  // Get tickets created by a specific user
  const getUserTickets = (userId: string) => {
    return tickets.filter(ticket => ticket.createdBy === userId);
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
    <>
      {/* Auth Pages - Show when not logged in */}
      {!currentUser && (
        <>
          {authView === 'login' && (
            <LoginPage
              onLogin={handleLogin}
              onNavigateToRegister={() => setAuthView('register')}
              onNavigateToForgotPassword={() => setAuthView('forgot-password')}
            />
          )}
          {authView === 'register' && (
            <RegisterPage
              onRegisterSuccess={() => setAuthView('login')}
              onNavigateToLogin={() => setAuthView('login')}
            />
          )}
          {authView === 'forgot-password' && (
            <ForgotPasswordPage
              onResetSuccess={() => setAuthView('login')}
              onNavigateToLogin={() => setAuthView('login')}
            />
          )}
        </>
      )}

      {/* Main App - Show when logged in */}
      {currentUser && (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {/* Navbar */}
          <NavbarNew
            currentUser={currentUser}
            onLogoClick={handleLogoClick}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />

          {/* Profile Modal */}
          {showProfileModal && currentUser && (
            <ProfileModal
              user={currentUser}
              onClose={() => setShowProfileModal(false)}
              onUpdate={(updatedUser: User) => {
                setCurrentUser(updatedUser);
              }}
            />
          )}

          {/* Content */}
          <div>
        {/* Student Page */}
        {currentRole === 'student' && (
          <StudentHomePage
            currentUser={currentUser}
            tickets={tickets}
            onTicketCreated={(newTicket) => {
              setTickets(prev => [...prev, newTicket]);
            }}
          />
        )}



        {/* Staff Pages */}
        {isStaffRole(currentRole) && (
          <>
            {staffType === 'it' && (
              <ITStaffPage
                tickets={staffTickets}
                onUpdateStatus={handleUpdateTicketStatus}
                onViewDetail={(ticket: Ticket) => setSelectedTicket(ticket)}
              />
            )}
            {staffType === 'facility' && (
              <FacilityStaffPage
                tickets={staffTickets}
                onUpdateStatus={handleUpdateTicketStatus}
                onViewDetail={(ticket: Ticket) => setSelectedTicket(ticket)}
              />
            )}
          </>
        )}

        {/* Admin Page */}
        {currentRole === 'admin' && (
          <AdminPage currentAdminId={currentAdminId} />
        )}

        
        {/* Ticket Detail Modal for Admin and Staff */}
        {(currentRole === 'admin' || isStaffRole(currentRole)) && selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket!}
            onClose={() => setSelectedTicket(null)}
          />
          )}
        </div>
      </div>
      )}
    </>
  );
}

export default App;

