import type { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Navbar = ({ currentRole, onRoleChange }: NavbarProps) => {
  const styles = {
    navbar: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    brand: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    title: {
      margin: 0,
      fontSize: '1.8rem',
      fontWeight: 700,
      color: 'white',
    },
    subtitle: {
      margin: '0.25rem 0 0 0',
      fontSize: '0.85rem',
      opacity: 0.9,
      fontWeight: 400,
    },
    roles: {
      display: 'flex',
      gap: '0.75rem',
    },
    roleBtn: {
      padding: '0.6rem 1.2rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    },
    roleBtnActive: {
      padding: '0.6rem 1.2rem',
      border: '2px solid white',
      background: 'white',
      color: '#f97316',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 600,
      transition: 'all 0.3s ease',
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <h1 style={styles.title}>FPTInsight</h1>
        <p style={styles.subtitle}>Facility Feedback & Helpdesk System</p>
      </div>
      <div style={styles.roles}>
        <button
          style={currentRole === 'student' ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onRoleChange('student')}
        >
          Student
        </button>
        <button
          style={currentRole === 'staff' ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onRoleChange('staff')}
        >
          Staff
        </button>
        <button
          style={currentRole === 'admin' ? styles.roleBtnActive : styles.roleBtn}
          onClick={() => onRoleChange('admin')}
        >
          Department Admin
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

