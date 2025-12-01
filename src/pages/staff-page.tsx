const StaffPage = () => {
  const styles = {
    page: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center' as const,
    },
    badge: {
      display: 'inline-block',
      padding: '0.5rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      marginBottom: '1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
    },
    title: {
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
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.badge}>Staff</div>
        <h2 style={styles.title}>Trang Nhân viên</h2>
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
    </div>
  );
};

export default StaffPage;

