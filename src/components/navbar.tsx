import type { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Navbar = ({ currentRole, onRoleChange }: NavbarProps) => {
  return (
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
          onClick={() => onRoleChange('student')}
        >
          Student
        </button>
        <button
          className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
            currentRole === 'staff'
              ? 'border-2 border-white bg-white text-orange-500 font-semibold'
              : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
          }`}
          onClick={() => onRoleChange('staff')}
        >
          Staff
        </button>
        <button
          className={`py-2.5 px-5 rounded-lg cursor-pointer text-[0.95rem] transition-all duration-300 ${
            currentRole === 'admin'
              ? 'border-2 border-white bg-white text-orange-500 font-semibold'
              : 'border-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20'
          }`}
          onClick={() => onRoleChange('admin')}
        >
          Department Admin
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

