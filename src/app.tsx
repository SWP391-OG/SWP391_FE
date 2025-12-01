import { useState } from 'react';
import type { UserRole } from './types';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
    },
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
    roleBtn: (active: boolean) => ({
      padding: '0.6rem 1.2rem',
      border: active ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.3)',
      background: active ? 'white' : 'rgba(255, 255, 255, 0.1)',
      color: active ? '#f97316' : 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: active ? 600 : 500,
    }),
    page: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
    badge: (role: UserRole) => ({
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      marginBottom: '1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      background: role === 'student' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                  role === 'staff' ? 'linear-gradient(135deg, #10b981, #059669)' :
                  'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
    }),
    pageTitle: {
      fontSize: '2rem',
      margin: '0.5rem 0',
      color: '#1f2937',
    },
    description: {
      fontSize: '1rem',
      color: '#6b7280',
      maxWidth: '800px',
      margin: '0.5rem auto',
      lineHeight: 1.6,
    },
    infoBox: {
      background: 'white',
      borderRadius: '12px',
      padding: '3rem 2rem',
      textAlign: 'center' as const,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      maxWidth: '700px',
      margin: '2rem auto',
      border: '2px solid #f3f4f6',
    },
    icon: {
      fontSize: '5rem',
      marginBottom: '1.5rem',
    },
    infoTitle: {
      fontSize: '1.75rem',
      color: '#1f2937',
      marginBottom: '1rem',
      fontWeight: 700,
    },
    infoText: {
      color: '#6b7280',
      fontSize: '1.1rem',
      lineHeight: 1.8,
      maxWidth: '500px',
      margin: '0 auto',
    },
  };

  return (
    <div style={styles.app}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          <h1 style={styles.title}>FPTInsight</h1>
          <p style={styles.subtitle}>Facility Feedback & Helpdesk System</p>
        </div>
        <div style={styles.roles}>
          <button style={styles.roleBtn(currentRole === 'student')} onClick={() => setCurrentRole('student')}>
            Student
          </button>
          <button style={styles.roleBtn(currentRole === 'staff')} onClick={() => setCurrentRole('staff')}>
            Staff
          </button>
          <button style={styles.roleBtn(currentRole === 'admin')} onClick={() => setCurrentRole('admin')}>
            Department Admin
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={styles.page}>
        {/* Student Page */}
        {currentRole === 'student' && (
          <>
            <div style={styles.header}>
              <div style={styles.badge('student')}>Student</div>
              <h2 style={styles.pageTitle}>Trang Sinh viên</h2>
              <p style={styles.description}>
                Bạn đang ở trang dành cho Sinh viên
              </p>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.icon}>👨‍🎓</div>
              <h3 style={styles.infoTitle}>Chức năng dành cho Sinh viên</h3>
              <p style={styles.infoText}>
                Sinh viên có thể gửi phản ánh về cơ sở vật chất, WiFi, thiết bị và theo dõi trạng thái xử lý.
              </p>
            </div>
          </>
        )}

        {/* Staff Page */}
        {currentRole === 'staff' && (
          <>
            <div style={styles.header}>
              <div style={styles.badge('staff')}>Staff</div>
              <h2 style={styles.pageTitle}>Trang Nhân viên</h2>
              <p style={styles.description}>
                Bạn đang ở trang dành cho Nhân viên
              </p>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.icon}>👨‍💼</div>
              <h3 style={styles.infoTitle}>Chức năng dành cho Nhân viên</h3>
              <p style={styles.infoText}>
                Nhân viên có thể tiếp nhận, xử lý và cập nhật trạng thái các ticket theo SLA.
              </p>
            </div>
          </>
        )}

        {/* Admin Page */}
        {currentRole === 'admin' && (
          <>
            <div style={styles.header}>
              <div style={styles.badge('admin')}>Department Admin</div>
              <h2 style={styles.pageTitle}>Admin Dashboard</h2>
              <p style={styles.description}>
                Chào mừng quản trị viên! Quản lý phòng/bộ phận, cấu hình hệ thống và giám sát hoạt động.
              </p>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.icon}>👨‍💼</div>
              <h3 style={styles.infoTitle}>Chức năng dành cho Admin</h3>
              <p style={styles.infoText}>
                Quản trị viên có quyền quản lý CRUD phòng/bộ phận, cấu hình hệ thống và giám sát toàn bộ hoạt động.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
