import { useState, useEffect } from 'react';
import type { UserRole, User, Ticket } from './types';
import { 
  loadTickets, loadCurrentUser, saveCurrentUser
} from './utils/localStorage';
import { useTicketByCode } from './hooks/useTicketByCode';
import { authService } from './services/authService';
import { ticketService } from './services/ticketService';
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
    // Directly load saved user from localStorage
    // No need to verify against mock users since user data comes from backend API
    if (savedUser && savedUser.status === 'active' && savedUser.isActive) {
      return savedUser;
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
  
  // Initialize tickets state from mock data (not persisted to localStorage)
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  
  // Note: Tickets are NOT saved to localStorage
  // Data is managed server-side or loaded from mock data

  // Sync tickets when component updates (no localStorage persistence)

  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Listen for storage changes from other tabs (cross-tab session sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // When fptech_current_user changes in another tab
      if (e.key === 'fptech_current_user') {
        // If the new value is null, user logged out from another tab
        if (e.newValue === null) {
          setCurrentUser(null);
          console.log('🔓 User logged out from another tab');
        } 
        // If there's a new value, user logged in from another tab
        else if (e.newValue) {
          try {
            const newUser = JSON.parse(e.newValue);
            if (newUser && newUser.status === 'active' && newUser.isActive) {
              setCurrentUser(newUser);
              console.log('✅ Session synchronized from another tab:', newUser.fullName);
            }
          } catch (error) {
            console.error('Error parsing user data from storage event:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // currentRole is derived from currentUser
  };

  const handleLogout = () => {
    // Clear all auth data (token + user)
    authService.logout();
    // Reset app state
    setCurrentUser(null);
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
          {showProfileModal && (
            <ProfileModal
              onClose={() => setShowProfileModal(false)}
              onUpdate={() => {
                // Profile đã được cập nhật, có thể refresh data nếu cần
                console.log('✅ Profile updated successfully');
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
            currentUser={currentUser ? { id: String(currentUser.id), fullName: currentUser.fullName } : null}
            tickets={tickets}
            onTicketCreated={(newTicket) => {
              setTickets(prev => [...prev, newTicket]);
            }}
            onTicketUpdated={(updatedTicket) => {
              setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            }}
            onFeedbackUpdated={async (ticketId, ratingStars, ratingComment) => {
              try {
                // Call API to update feedback
                const response = await ticketService.updateFeedback(ticketId, ratingStars, ratingComment);
                
                if (response.status) {
                  // Update local state after successful API call
                  // This will make the UI update immediately without needing refresh
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
                  // Don't show alert - feedback section will update immediately
                } else {
                  throw new Error(response.message || 'Failed to update feedback');
                }
              } catch (error) {
                console.error('Error updating feedback:', error);
                throw error; // Re-throw so modal can handle and show error
              }
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

