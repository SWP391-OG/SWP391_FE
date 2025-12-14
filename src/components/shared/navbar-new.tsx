import { useState, useEffect, useRef } from 'react';
import type { User, UserRole } from '../../types';
import { useNotifications, type NotificationItem } from '../../hooks/useNotifications';

interface NavbarNewProps {
  currentUser: User | null;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onNotificationClick?: (ticketCode: string) => void;
}

const NavbarNew = ({ 
  currentUser, 
  onLogoClick, 
  onProfileClick, 
  onLogout,
  onNotificationClick,
}: NavbarNewProps) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const { notifications, showAll, setShowAll, markAllAsRead, markAsRead } = useNotifications();

  // Close any open dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
    };

    if (showProfileDropdown || showNotifDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, showNotifDropdown]);

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
    setShowProfileDropdown(false);
    onProfileClick();
  };

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    onLogout();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (iso: string) => {
    // Normalize timestamp by adding Z if missing (backend returns without Z)
    const normalizedIso = iso.includes('Z') ? iso : `${iso}Z`;
    const t = Date.now() - new Date(normalizedIso).getTime();
    const seconds = Math.floor(t / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const renderTypeIcon = (type?: NotificationItem['type']) => {
    switch (type) {
      case 'TICKET_CREATED':
        return (
          <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'TICKET_ASSIGNED':
        return (
          <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
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
          <div className="flex items-center gap-6">
            {/* Bell Icon - Notifications (LEFT) */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifDropdown(!showNotifDropdown);
                }}
                title="Thông báo"
              >
                {/* Bell icon (white) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L3 17h12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white rounded-full bg-red-600"
                    style={{ minWidth: 18, height: 18 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <div
                  className="absolute left-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50"
                  style={{ minWidth: 450, maxWidth: 500 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="font-semibold text-lg">Thông báo</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-orange-600 hover:underline"
                    >
                      Đánh dấu tất cả là đã đọc
                    </button>
                  </div>

                  {/* Body - list */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-5 text-sm text-gray-500">Chưa có thông báo</div>
                    )}
                    {notifications.map((n) => {
                      const isUnread = !n.read;
                      return (
                        <div
                          key={n.id}
                          className={`flex gap-4 items-start px-5 py-4 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-[#fff3e0]' : 'bg-white'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                            // Pass ticketCode to parent component
                            if (n.ticketCode && onNotificationClick) {
                              onNotificationClick(n.ticketCode);
                            }
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center border border-gray-200">
                              {renderTypeIcon(n.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="text-base font-semibold text-gray-900">
                                  {n.title}
                                </div>
                                {isUnread && <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 mt-0.5" />}
                              </div>
                              <div className="text-xs text-gray-400 whitespace-nowrap">
                                {formatTimeAgo(n.time)}
                              </div>
                            </div>

                            {n.description && (
                              <div className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">
                                {n.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (showAll) {
                          // Nếu đang xem tất cả, quay lại xem chỉ chưa đọc
                          setShowAll(false);
                        } else {
                          // Nếu xem chưa đọc, chuyển sang xem tất cả
                          setShowAll(true);
                        }
                      }}
                      className="w-full text-sm text-center px-4 py-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                    >
                      {showAll ? 'Chỉ hiện thông báo chưa đọc' : 'Xem tất cả thông báo'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info & Account (RIGHT) */}
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold">{currentUser.fullName}</div>
              <div className="text-xs opacity-80">
                {currentUser.role === 'student' ? 'Sinh viên' : 
                 currentUser.role === 'it-staff' ? 'IT Staff' : 
                 currentUser.role === 'facility-staff' ? 'Facility Staff' : 
                 'Admin'}
              </div>
            </div>
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
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
                  className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 transition-all duration-200 ease-out"
                  style={{
                    opacity: showProfileDropdown ? 1 : 0,
                    transform: showProfileDropdown ? 'translateY(0)' : 'translateY(-10px)',
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

