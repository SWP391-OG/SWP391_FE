import type { User, UserRole } from '../../types';

interface NavbarNewProps {
  currentUser: User | null;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const NavbarNew = ({ currentUser, onLogoClick, onProfileClick, onLogout }: NavbarNewProps) => {
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
            <button
              className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
              onClick={onProfileClick}
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                {getRoleIcon(currentUser.role)}
              </div>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-medium"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarNew;

