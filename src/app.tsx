import { useState } from 'react';
import type { User } from './types';
import Navbar from './components/navbar';
import LoginModal from './components/login-modal';
import RegisterModal from './components/register-modal';
import ForgotPasswordModal from './components/forgot-password-modal';
import ProfileModal from './components/profile-modal';
import StudentView from './views/student-view';
import StaffView from './views/staff-view';
import AdminView from './views/admin-view';

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // View state - determined by user role
  const currentRole = currentUser?.role || 'student';

  // Authentication handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Render appropriate view based on role
  const renderView = () => {
    if (!currentUser) {
      return <StudentView currentUser={null} />;
    }

    switch (currentRole) {
      case 'student':
      case 'teacher':
        return <StudentView currentUser={currentUser} />;
      
      case 'it-staff':
      case 'facility-staff':
        return <StaffView currentUser={currentUser} />;
      
      case 'admin':
        return <AdminView currentUser={currentUser} />;
      
      default:
        return <StudentView currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogin={() => setShowLoginModal(true)}
        onRegister={() => setShowRegisterModal(true)}
        onLogout={handleLogout}
        onShowProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content */}
      {renderView()}

      {/* Modals */}
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

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onRegisterSuccess={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPasswordModal(false)}
          onResetSuccess={() => {
            setShowForgotPasswordModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}

export default App;