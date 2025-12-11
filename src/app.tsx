import { useState, useEffect } from 'react';
import type { UserRole, User, Ticket } from './types';
import { 
  loadTickets, saveTickets, loadCurrentUser, saveCurrentUser, loadUsers
} from './utils/localStorage';
import { useTicketByCode } from './hooks/useTicketByCode';
import StaffPage from './pages/staff/staff-page';
import AdminPage from './pages/admin/admin-page';
import StudentHomePage from './pages/student/student-home-page';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ForgotPasswordPage from './pages/auth/forgot-password-page';
import ProfileModal from './components/shared/profile-modal';
import NotificationTicketDetail from './components/shared/notification-ticket-detail';
import NavbarNew from './components/shared/navbar-new';
import Footer from './components/shared/footer';

function App() {
  // Auth state - Load from localStorage on mount
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = loadCurrentUser();
    // Verify user still exists in users list and is active
    if (savedUser) {
      const users = loadUsers();
      const userExists = users.find((u: User) => u.id === savedUser.id && (u.status === 'active' || u.isActive));
      return userExists || null;
    }
    return null;
  });
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);
  
  // Fetch ticket from API by code
  const { ticket: selectedTicket } = useTicketByCode(showTicketDetailModal ? selectedTicketCode : null);
  
  // Mock current user IDs (sẽ thay bằng authentication sau)
  const [currentAdminId] = useState<string>('admin-001'); // IT Admin - quản lý IT Department
  
  // Derive currentRole from currentUser instead of using state
  const currentRole = currentUser?.role || 'admin';
  
  // Initialize tickets state from localStorage
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  
  // Save tickets to localStorage whenever data changes
  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

  // Sync tickets from localStorage when changed by other components (e.g., AdminPage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tickets') {
        const updatedTickets = loadTickets();
        setTickets(updatedTickets);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically (every 2 seconds) to catch changes from same tab
    const interval = setInterval(() => {
      const currentTickets = loadTickets();
      // Only update if tickets actually changed (compare by length and IDs)
      const currentIds = currentTickets.map(t => t.id).sort().join(',');
      const stateIds = tickets.map(t => t.id).sort().join(',');
      if (currentIds !== stateIds || currentTickets.length !== tickets.length) {
        setTickets(currentTickets);
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [tickets]);

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Login handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // currentRole is derived from currentUser
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login'); // Return to login page
    // currentRole and staffType will be reset by useEffect above
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

  // Helper function to check if role is staff
  const isStaffRole = (role: UserRole): boolean => {
    return role === 'it-staff' || role === 'facility-staff';
  };

  // Auto-escalate overdue tickets (check periodically)
  useEffect(() => {
    const checkOverdueTickets = () => {
      const now = new Date();
      setTickets(prevTickets => {
        return prevTickets.map(ticket => {
          // Chỉ escalate tickets đang mở hoặc đang xử lý và quá hạn
          if (
            (ticket.status === 'open' || ticket.status === 'acknowledged' || ticket.status === 'in-progress') &&
            ticket.slaTracking?.deadline &&
            new Date(ticket.slaTracking.deadline) < now &&
            !ticket.slaTracking.timeline.some(e => e.action.includes('escalated'))
          ) {
            const escalateEvent = {
              id: `event-auto-escalate-${Date.now()}`,
              timestamp: now.toISOString(),
              status: 'in-progress' as const,
              actor: 'Hệ thống',
              actorRole: 'admin' as const,
              action: 'Ticket tự động escalate (quá hạn SLA)',
              note: `Ticket quá hạn SLA ${Math.round((now.getTime() - new Date(ticket.slaTracking.deadline).getTime()) / (1000 * 60))} phút`,
            };
            
            return {
              ...ticket,
              slaTracking: {
                ...ticket.slaTracking,
                timeline: [...(ticket.slaTracking.timeline || []), escalateEvent],
                isOverdue: true,
              },
            };
          }
          return ticket;
        });
      });
    };

    // Check every 5 minutes
    const interval = setInterval(checkOverdueTickets, 5 * 60 * 1000);
    checkOverdueTickets(); // Check immediately

    return () => clearInterval(interval);
  }, []);

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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
          {/* Navbar */}
          <NavbarNew
            currentUser={currentUser}
            onLogoClick={handleLogoClick}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={handleLogout}
            onNotificationClick={(ticketCode: string) => {
              setSelectedTicketCode(ticketCode);
              setShowTicketDetailModal(true);
            }}
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

          {/* Ticket Detail Modal from Notification */}
          {showTicketDetailModal && selectedTicket && (
            <NotificationTicketDetail
              ticket={selectedTicket}
              onClose={() => {
                setShowTicketDetailModal(false);
                setSelectedTicketCode(null);
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
            onTicketUpdated={(updatedTicket) => {
              setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            }}
            onFeedbackUpdated={(ticketId, ratingStars, ratingComment) => {
              setTickets(prev => prev.map(t => {
                if (t.id === ticketId) {
                  return {
                    ...t,
                    ratingStars,
                    ratingComment,
                    closedAt: t.closedAt || new Date().toISOString(),
                  };
                }
                return t;
              }));
            }}
          />
        )}



        {/* Staff Pages */}
        {isStaffRole(currentRole) && (
          <StaffPage />
        )}

        {/* Admin Page */}
        {currentRole === 'admin' && (
          <AdminPage currentAdminId={currentAdminId} />
        )}
        </div>
        <Footer />
      </div>
      )}
    </>
  );
}

export default App;

