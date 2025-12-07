import { useState, useEffect, useRef } from 'react';
import type { User, UserRole } from '../../types';

interface NavbarNewProps {
  currentUser: User | null;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const NavbarNew = ({ currentUser, onLogoClick, onProfileClick, onLogout }: NavbarNewProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return '👨‍🎓';
      case 'it-staff':
        return '👨‍💻';
      case 'facility-staff':
        return '👨‍🔧';
      case 'admin':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    onProfileClick();
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 shadow-lg">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        {/* Logo - Clickable */}
        <div className="flex items-center">
          <img 
            src="/logoFPTechnical.jpg" 
            alt="FPTechnical Logo" 
            className="h-10 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onLogoClick}
          />
        </div>

        {/* User Avatar and Menu */}
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold">{currentUser.fullName}</div>
              <div className="text-xs opacity-80">
                {currentUser.role === 'student' ? 'Sinh viên' : 
                 currentUser.role === 'it-staff' ? 'IT Staff' : 
                 currentUser.role === 'facility-staff' ? 'Facility Staff' : 
                 'Admin'}
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  {getRoleIcon(currentUser.role)}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 transition-all duration-200 ease-out"
                  style={{
                    opacity: showDropdown ? 1 : 0,
                    transform: showDropdown ? 'translateY(0)' : 'translateY(-10px)',
                  }}
                >
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    Thông tin
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarNew;

