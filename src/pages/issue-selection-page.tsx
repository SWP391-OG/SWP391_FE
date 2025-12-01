import { issueTypes } from '../data/issueTypes';
import type { IssueType } from '../types';

interface IssueSelectionPageProps {
  onSelectIssue: (issueType: IssueType) => void;
  onBack?: () => void;
}

const IssueSelectionPage = ({ onSelectIssue, onBack }: IssueSelectionPageProps) => {
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
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
      margin: '0.5rem auto 2rem',
      lineHeight: 1.6,
    },
    backButton: {
      padding: '0.75rem 1.5rem',
      background: '#e5e7eb',
      color: '#374151',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: 500,
      marginBottom: '1.5rem',
      transition: 'all 0.2s',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      padding: '1rem 0',
    },
    issueCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      border: '2px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    issueCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      borderColor: '#3b82f6',
    },
    iconContainer: {
      fontSize: '3rem',
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
    },
    issueName: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '0.5rem',
      textAlign: 'center' as const,
    },
    issueDescription: {
      fontSize: '0.9rem',
      color: '#6b7280',
      lineHeight: 1.6,
      textAlign: 'center' as const,
      marginBottom: '1rem',
    },
    examplesContainer: {
      background: '#f9fafb',
      borderRadius: '8px',
      padding: '0.75rem',
      marginTop: 'auto',
    },
    examplesTitle: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '0.5rem',
    },
    examplesList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    exampleItem: {
      fontSize: '0.8rem',
      color: '#6b7280',
      padding: '0.25rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    bullet: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      background: '#3b82f6',
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {onBack && (
          <div style={{ textAlign: 'left' }}>
            <button 
              style={styles.backButton}
              onClick={onBack}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
            >
              ← Quay lại
            </button>
          </div>
        )}
        <div style={styles.badge}>Tạo Ticket Mới</div>
        <h2 style={styles.title}>Chọn Loại Vấn Đề</h2>
        <p style={styles.description}>
          Vui lòng chọn loại vấn đề mà bạn đang gặp phải. Điều này giúp chúng tôi xử lý nhanh hơn và chuyển đến bộ phận phù hợp.
        </p>
      </div>

      <div style={styles.gridContainer}>
        {issueTypes.map((issueType) => (
          <div
            key={issueType.id}
            style={styles.issueCard}
            onClick={() => onSelectIssue(issueType)}
            onMouseOver={(e) => {
              Object.assign(e.currentTarget.style, styles.issueCardHover);
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={styles.iconContainer}>{issueType.icon}</div>
            <h3 style={styles.issueName}>{issueType.name}</h3>
            <p style={styles.issueDescription}>{issueType.description}</p>
            
            {issueType.examples && issueType.examples.length > 0 && (
              <div style={styles.examplesContainer}>
                <div style={styles.examplesTitle}>Ví dụ:</div>
                <ul style={styles.examplesList}>
                  {issueType.examples.slice(0, 3).map((example, idx) => (
                    <li key={idx} style={styles.exampleItem}>
                      <div style={styles.bullet}></div>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueSelectionPage;

