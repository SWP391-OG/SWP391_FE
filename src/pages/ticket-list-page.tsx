import { useState, useMemo } from 'react';
import type { Ticket } from '../types';
import { mockTickets } from '../data/mockTickets';

interface TicketListPageProps {
  onViewDetail: (ticket: Ticket) => void;
  onBack: () => void;
}

const TicketListPage = ({ onViewDetail, onBack }: TicketListPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Ticket['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Ticket['priority'] | 'all'>('all');

  // Calculate SLA status
  const getSLAStatus = (ticket: Ticket) => {
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const createdAt = new Date(ticket.createdAt);
      const resolvedAt = new Date(ticket.updatedAt || ticket.createdAt);
      if (resolvedAt <= deadline) {
        return { status: 'completed', label: 'Hoàn thành đúng hạn', color: '#10b981' };
      } else {
        return { status: 'completed-late', label: 'Hoàn thành trễ', color: '#f59e0b' };
      }
    }
    
    if (hoursRemaining < 0) {
      return { status: 'overdue', label: 'Quá hạn', color: '#ef4444' };
    } else if (hoursRemaining <= 2) {
      return { status: 'critical', label: 'Sắp quá hạn', color: '#f97316' };
    } else if (hoursRemaining <= 6) {
      return { status: 'warning', label: 'Cần chú ý', color: '#f59e0b' };
    } else {
      return { status: 'on-time', label: 'Đúng hạn', color: '#10b981' };
    }
  };

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, filterStatus, filterPriority]);

  const styles = {
    page: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    header: {
      marginBottom: '2rem',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '2rem',
      margin: 0,
      color: '#1f2937',
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
      transition: 'all 0.2s',
    },
    filterSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '2rem',
    },
    filterRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr',
      gap: '1rem',
      alignItems: 'end',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#374151',
    },
    searchInput: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
    },
    select: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
    },
    ticketGrid: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    ticketCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '2px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    ticketCardHover: {
      borderColor: '#3b82f6',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
    ticketHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
    },
    ticketHeaderLeft: {
      flex: 1,
    },
    ticketId: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    ticketTitle: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#1f2937',
      margin: '0 0 0.5rem 0',
    },
    ticketMeta: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
    },
    badge: (bgColor: string, textColor: string = 'white') => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: 600,
      background: bgColor,
      color: textColor,
    }),
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    ticketDescription: {
      fontSize: '0.95rem',
      color: '#6b7280',
      lineHeight: 1.6,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    ticketFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
    },
    slaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
    },
    viewDetailButton: {
      padding: '0.5rem 1rem',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 500,
      transition: 'all 0.2s',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '4rem 2rem',
      background: 'white',
      borderRadius: '12px',
      border: '2px dashed #d1d5db',
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
    },
    emptyTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '0.5rem',
    },
    emptyText: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    statLabel: {
      fontSize: '0.85rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1f2937',
    },
  };

  // Status colors
  const statusColors = {
    open: { bg: '#dbeafe', text: '#1e40af' },
    'in-progress': { bg: '#fef3c7', text: '#92400e' },
    resolved: { bg: '#d1fae5', text: '#065f46' },
    closed: { bg: '#f3f4f6', text: '#374151' },
  };

  // Priority colors
  const priorityColors = {
    low: { bg: '#d1fae5', text: '#065f46' },
    medium: { bg: '#fef3c7', text: '#92400e' },
    high: { bg: '#fed7aa', text: '#9a3412' },
    urgent: { bg: '#fecaca', text: '#991b1b' },
  };

  // Priority labels
  const priorityLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };

  // Status labels
  const statusLabels = {
    open: 'Mở',
    'in-progress': 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
  };

  // Calculate stats
  const stats = {
    total: mockTickets.length,
    open: mockTickets.filter(t => t.status === 'open').length,
    inProgress: mockTickets.filter(t => t.status === 'in-progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ngày trước`;
    }
  };

  // Format time remaining
  const formatTimeRemaining = (slaDeadline: string) => {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffInHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) {
      const overdue = Math.abs(Math.floor(diffInHours));
      return `Quá hạn ${overdue} giờ`;
    } else if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `Còn ${minutes} phút`;
    } else if (diffInHours < 24) {
      return `Còn ${Math.floor(diffInHours)} giờ`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Còn ${days} ngày`;
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h2 style={styles.title}>📋 Danh Sách Ticket</h2>
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

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tổng số ticket</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Đang mở</div>
            <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.open}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Đang xử lý</div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.inProgress}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Hoàn thành</div>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.resolved}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterSection}>
          <div style={styles.filterRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tiêu đề hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={styles.select}
              >
                <option value="all">Tất cả</option>
                <option value="open">Mở</option>
                <option value="in-progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ưu tiên</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                style={styles.select}
              >
                <option value="all">Tất cả</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>Không tìm thấy ticket</h3>
          <p style={styles.emptyText}>
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      ) : (
        <div style={styles.ticketGrid}>
          {filteredTickets.map((ticket) => {
            const slaStatus = getSLAStatus(ticket);
            return (
              <div
                key={ticket.id}
                style={styles.ticketCard}
                onClick={() => onViewDetail(ticket)}
                onMouseOver={(e) => {
                  Object.assign(e.currentTarget.style, styles.ticketCardHover);
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.ticketHeader}>
                  <div style={styles.ticketHeaderLeft}>
                    <div style={styles.ticketId}>{ticket.id}</div>
                    <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                    <div style={styles.ticketMeta}>
                      <span style={styles.badge(statusColors[ticket.status].bg, statusColors[ticket.status].text)}>
                        {statusLabels[ticket.status]}
                      </span>
                      <span style={styles.badge(priorityColors[ticket.priority].bg, priorityColors[ticket.priority].text)}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span style={styles.metaItem}>
                        <span>{ticket.issueType.icon}</span>
                        <span>{ticket.issueType.name}</span>
                      </span>
                      {ticket.location && (
                        <span style={styles.metaItem}>
                          <span>📍</span>
                          <span>{ticket.location} {ticket.roomNumber && `- ${ticket.roomNumber}`}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p style={styles.ticketDescription}>{ticket.description}</p>
                
                <div style={styles.ticketFooter}>
                  <div style={styles.slaInfo}>
                    <span style={styles.badge(slaStatus.color, 'white')}>
                      {slaStatus.label}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      • {formatTimeRemaining(ticket.slaDeadline)}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                      • {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <button
                    style={styles.viewDetailButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(ticket);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                    }}
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketListPage;
