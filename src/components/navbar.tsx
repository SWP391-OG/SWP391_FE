import type { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onShowProfile: () => void;
}

const Navbar = ({ currentUser, onLogin, onRegister, onLogout, onShowProfile }: NavbarProps) => {
  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 shadow-lg">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/logoFPTechnical.jpg" 
            alt="FPTechnical Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        
        <div className="flex gap-3">
          {currentUser ? (
            <>
              <button
                className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                onClick={onShowProfile}
              >
                <div className="text-right">
                  <div className="text-sm font-semibold">{currentUser.fullName}</div>
                  <div className="text-xs opacity-80">Xem hồ sơ</div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  {currentUser.role === 'student' ? '👨‍🎓' : 
                   currentUser.role === 'it-staff' ? '👨‍💻' : 
                   currentUser.role === 'facility-staff' ? '👨‍🔧' : '👨‍💼'}
                </div>
              </button>
              <button
                className="py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20"
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                className="py-2.5 px-6 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white bg-transparent text-white font-semibold hover:bg-white/10"
                onClick={onRegister}
              >
                📝 Đăng ký
              </button>
              <button
                className="py-2.5 px-6 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 border-2 border-white bg-white text-orange-500 font-semibold hover:bg-white/90 shadow-lg"
                onClick={onLogin}
              >
                🔐 Đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;