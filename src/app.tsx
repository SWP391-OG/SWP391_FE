import { useState, useMemo, useEffect } from 'react';
import type { UserRole, User, IssueType, Ticket } from './types';
import { 
  loadTickets, saveTickets, loadCurrentUser, saveCurrentUser, loadUsers
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
  
  // Mock current user IDs (sẽ thay bằng authentication sau)
  const [currentAdminId] = useState<string>('admin-001'); // IT Admin - quản lý IT Department
  
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUser = loadCurrentUser();
    return savedUser?.role || 'admin';
  });
  const [staffType, setStaffType] = useState<StaffType>(() => {
    const savedUser = loadCurrentUser();
    if (savedUser?.role === 'it-staff') return 'it';
    if (savedUser?.role === 'facility-staff') return 'facility';
    return 'it';
  });
  
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
  }, [tickets.length]); // Re-run if tickets length changes
  
  // Student page state - REMOVED, now handled in StudentHomePage
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);


  // Save currentUser to localStorage whenever it changes
  useEffect(() => {
    saveCurrentUser(currentUser);
    if (currentUser) {
      setCurrentRole(currentUser.role);
      // Set staffType based on role
      if (currentUser.role === 'it-staff') {
        setStaffType('it');
      } else if (currentUser.role === 'facility-staff') {
        setStaffType('facility');
      }
    } else {
      setCurrentRole('admin');
      setStaffType('it');
    }
  }, [currentUser]);

  // Login handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // currentRole and staffType will be set by useEffect above
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

  // Get tickets created by a specific user
  const getUserTickets = (userId: string) => {
    return tickets.filter(ticket => ticket.createdBy === userId);
  };


  // Get current staff ID from currentUser
  const getCurrentStaffId = () => {
    // Use currentUser.id if available (for dynamically created staff)
    if (currentUser && isStaffRole(currentUser.role)) {
      return currentUser.id;
    }
    // Fallback to hardcoded IDs for backward compatibility
    if (staffType === 'it') return 'staff-001'; // IT Staff
    return 'staff-003'; // Facility Staff
  };

  // Helper function to check if role is staff
  const isStaffRole = (role: UserRole): boolean => {
    return role === 'it-staff' || role === 'facility-staff';
  };

  // Filter tickets assigned to current staff
  const staffTickets = useMemo(() => {
    if (!isStaffRole(currentRole) || !currentUser) return [];
    const staffId = getCurrentStaffId();
    return tickets.filter(ticket => ticket.assignedTo === staffId);
  }, [tickets, currentRole, staffType, currentUser]);

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

  // Handle escalate ticket (for Staff)
  const handleEscalateTicket = (ticketId: string) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        const now = new Date().toISOString();
        // Add escalate event to timeline
        const escalateEvent = {
          id: `event-escalate-${Date.now()}`,
          timestamp: now,
          status: 'in-progress' as const,
          actor: currentUser?.fullName || 'Staff',
          actorRole: currentUser?.role || 'it-staff',
          action: 'Ticket escalated to Admin',
          note: 'Ticket được escalate lên Admin do gặp khó khăn trong xử lý',
        };
        
        return {
          ...t,
          // Mark as escalated (có thể thêm field escalated: true)
          slaTracking: {
            ...t.slaTracking,
            timeline: [...(t.slaTracking?.timeline || []), escalateEvent],
          },
          updatedAt: now,
        };
      }
      return t;
    }));
    alert('Ticket đã được escalate lên Admin. Admin sẽ xem xét và xử lý.');
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
            onEscalate={isStaffRole(currentRole) ? handleEscalateTicket : undefined}
            showEscalateButton={isStaffRole(currentRole)}
          />
          )}
        </div>
      </div>
      )}
    </>
  );
}

export default App;

