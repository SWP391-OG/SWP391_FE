import { useEffect } from 'react';
import type { Ticket } from '../types';
import { mockSLAEvents, type SLAEvent } from '../data/mockTickets';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketDetailModal = ({ ticket, onClose }: TicketDetailModalProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Get SLA events for this ticket
  const slaEvents = mockSLAEvents[ticket.id] || [];

  // Calculate SLA progress
  const getSLAProgress = () => {
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const deadline = new Date(ticket.slaDeadline);
    
    const totalDuration = deadline.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const progress = Math.min((elapsed / totalDuration) * 100, 100);
    
    return {
      progress,
      isOverdue: now > deadline,
      hoursTotal: totalDuration / (1000 * 60 * 60),
      hoursElapsed: elapsed / (1000 * 60 * 60),
      hoursRemaining: (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
    };
  };

  const slaProgress = getSLAProgress();

  // Get SLA color based on progress
  const getSLAColor = () => {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const resolvedAt = new Date(ticket.updatedAt || ticket.createdAt);
      const deadline = new Date(ticket.slaDeadline);
      return resolvedAt <= deadline ? '#10b981' : '#f59e0b';
    }
    
    if (slaProgress.isOverdue) return '#ef4444';
    if (slaProgress.progress > 90) return '#f97316';
    if (slaProgress.progress > 70) return '#f59e0b';
    return '#10b981';
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modal: {
      background: 'white',
      borderRadius: '16px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative' as const,
    },
    modalHeader: {
      padding: '2rem',
      borderBottom: '2px solid #f3f4f6',
      position: 'sticky' as const,
      top: 0,
      background: 'white',
      zIndex: 10,
    },
    closeButton: {
      position: 'absolute' as const,
      top: '1.5rem',
      right: '1.5rem',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      fontSize: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      color: '#6b7280',
    },
    ticketId: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    ticketTitle: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#1f2937',
      margin: '0 0 1rem 0',
      paddingRight: '3rem',
    },
    badgeRow: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap' as const,
      marginBottom: '1rem',
    },
    badge: (bgColor: string, textColor: string = 'white') => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      background: bgColor,
      color: textColor,
    }),
    modalBody: {
      padding: '2rem',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#1f2937',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    sectionContent: {
      fontSize: '1rem',
      color: '#4b5563',
      lineHeight: 1.8,
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    infoItem: {
      background: '#f9fafb',
      padding: '1rem',
      borderRadius: '8px',
    },
    infoLabel: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: '#6b7280',
      marginBottom: '0.25rem',
    },
    infoValue: {
      fontSize: '1rem',
      color: '#1f2937',
      fontWeight: 500,
    },
    slaCard: {
      background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    slaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    slaTitle: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: '#1f2937',
    },
    slaStatus: (color: string) => ({
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      background: color,
      color: 'white',
    }),
    progressBar: {
      width: '100%',
      height: '12px',
      background: '#e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
      marginBottom: '1rem',
      position: 'relative' as const,
    },
    progressFill: (width: number, color: string) => ({
      width: `${width}%`,
      height: '100%',
      background: color,
      transition: 'width 0.3s ease',
      borderRadius: '6px',
    }),
    slaStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginTop: '1rem',
    },
    slaStat: {
      textAlign: 'center' as const,
    },
    slaStatLabel: {
      fontSize: '0.85rem',
      color: '#6b7280',
      marginBottom: '0.25rem',
    },
    slaStatValue: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1f2937',
    },
    slaStatUnit: {
      fontSize: '0.9rem',
      fontWeight: 400,
      color: '#6b7280',
    },
    timeline: {
      position: 'relative' as const,
      paddingLeft: '2rem',
    },
    timelineLine: {
      position: 'absolute' as const,
      left: '0.5rem',
      top: '1rem',
      bottom: '1rem',
      width: '2px',
      background: '#e5e7eb',
    },
    timelineItem: {
      position: 'relative' as const,
      paddingBottom: '1.5rem',
    },
    timelineItemLast: {
      paddingBottom: 0,
    },
    timelineDot: (color: string) => ({
      position: 'absolute' as const,
      left: '-1.5rem',
      top: '0.25rem',
      width: '1rem',
      height: '1rem',
      borderRadius: '50%',
      background: color,
      border: '3px solid white',
      boxShadow: '0 0 0 2px ' + color,
    }),
    timelineContent: {
      background: '#f9fafb',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
    timelineTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '0.25rem',
    },
    timelineDescription: {
      fontSize: '0.9rem',
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    timelineMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.85rem',
      color: '#9ca3af',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    },
    imageWrapper: {
      borderRadius: '8px',
      overflow: 'hidden',
      border: '2px solid #e5e7eb',
      aspectRatio: '1',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
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

  // Event colors
  const eventColors = {
    created: '#3b82f6',
    assigned: '#8b5cf6',
    in_progress: '#f59e0b',
    resolved: '#10b981',
    closed: '#6b7280',
    comment: '#6366f1',
  };

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format hours
  const formatHours = (hours: number) => {
    if (hours < 0) {
      return `${Math.abs(Math.floor(hours))}h (quá hạn)`;
    }
    if (hours < 1) {
      return `${Math.floor(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${Math.floor(hours)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            ×
          </button>
          
          <div style={styles.ticketId}>{ticket.id}</div>
          <h2 style={styles.ticketTitle}>{ticket.title}</h2>
          
          <div style={styles.badgeRow}>
            <span style={styles.badge(statusColors[ticket.status].bg, statusColors[ticket.status].text)}>
              {ticket.status === 'open' && '🔵 Mở'}
              {ticket.status === 'in-progress' && '🟡 Đang xử lý'}
              {ticket.status === 'resolved' && '🟢 Đã giải quyết'}
              {ticket.status === 'closed' && '⚫ Đã đóng'}
            </span>
            <span style={styles.badge(priorityColors[ticket.priority].bg, priorityColors[ticket.priority].text)}>
              {ticket.priority === 'urgent' && '🔴 Khẩn cấp'}
              {ticket.priority === 'high' && '🟠 Cao'}
              {ticket.priority === 'medium' && '🟡 Trung bình'}
              {ticket.priority === 'low' && '🟢 Thấp'}
            </span>
            <span style={styles.badge('#f3f4f6', '#1f2937')}>
              {ticket.issueType.icon} {ticket.issueType.name}
            </span>
          </div>
        </div>

        <div style={styles.modalBody}>
          {/* SLA Tracking */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              ⏱️ SLA Tracking
            </h3>
            <div style={styles.slaCard}>
              <div style={styles.slaHeader}>
                <div style={styles.slaTitle}>Tiến Độ Xử Lý</div>
                <div style={styles.slaStatus(getSLAColor())}>
                  {slaProgress.isOverdue && ticket.status !== 'resolved' && ticket.status !== 'closed' && 'Quá hạn'}
                  {!slaProgress.isOverdue && ticket.status !== 'resolved' && ticket.status !== 'closed' && 'Đang xử lý'}
                  {ticket.status === 'resolved' && new Date(ticket.updatedAt || '') <= new Date(ticket.slaDeadline) && 'Hoàn thành đúng hạn'}
                  {ticket.status === 'resolved' && new Date(ticket.updatedAt || '') > new Date(ticket.slaDeadline) && 'Hoàn thành trễ'}
                  {ticket.status === 'closed' && 'Đã đóng'}
                </div>
              </div>
              
              <div style={styles.progressBar}>
                <div style={styles.progressFill(slaProgress.progress, getSLAColor())}></div>
              </div>
              
              <div style={styles.slaStats}>
                <div style={styles.slaStat}>
                  <div style={styles.slaStatLabel}>Tổng thời gian SLA</div>
                  <div style={styles.slaStatValue}>
                    {formatHours(slaProgress.hoursTotal).split(' ')[0]}
                    <span style={styles.slaStatUnit}>{formatHours(slaProgress.hoursTotal).split(' ')[1] || ''}</span>
                  </div>
                </div>
                <div style={styles.slaStat}>
                  <div style={styles.slaStatLabel}>Đã trôi qua</div>
                  <div style={styles.slaStatValue}>
                    {formatHours(slaProgress.hoursElapsed).split(' ')[0]}
                    <span style={styles.slaStatUnit}>{formatHours(slaProgress.hoursElapsed).split(' ')[1] || ''}</span>
                  </div>
                </div>
                <div style={styles.slaStat}>
                  <div style={styles.slaStatLabel}>Còn lại</div>
                  <div style={{ ...styles.slaStatValue, color: getSLAColor() }}>
                    {formatHours(slaProgress.hoursRemaining).split(' ')[0]}
                    <span style={styles.slaStatUnit}>{formatHours(slaProgress.hoursRemaining).split(' ')[1] || ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Mô Tả Chi Tiết</h3>
            <div style={styles.sectionContent}>{ticket.description}</div>
          </div>

          {/* Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>ℹ️ Thông Tin</h3>
            <div style={styles.infoGrid}>
              {ticket.location && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Địa điểm</div>
                  <div style={styles.infoValue}>{ticket.location}</div>
                </div>
              )}
              {ticket.roomNumber && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Số phòng</div>
                  <div style={styles.infoValue}>{ticket.roomNumber}</div>
                </div>
              )}
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Ngày tạo</div>
                <div style={styles.infoValue}>{formatDateTime(ticket.createdAt)}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Deadline SLA</div>
                <div style={styles.infoValue}>{formatDateTime(ticket.slaDeadline)}</div>
              </div>
              {ticket.assignedTo && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Người xử lý</div>
                  <div style={styles.infoValue}>{ticket.assignedTo}</div>
                </div>
              )}
              {ticket.updatedAt && (
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Cập nhật lần cuối</div>
                  <div style={styles.infoValue}>{formatDateTime(ticket.updatedAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🖼️ Hình Ảnh</h3>
              <div style={styles.imageGrid}>
                {ticket.images.map((image, index) => (
                  <div key={index} style={styles.imageWrapper}>
                    <img src={image} alt={`Ticket image ${index + 1}`} style={styles.image} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Lịch Sử Xử Lý</h3>
            <div style={styles.timeline}>
              <div style={styles.timelineLine}></div>
              {slaEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  style={index === slaEvents.length - 1 ? styles.timelineItemLast : styles.timelineItem}
                >
                  <div style={styles.timelineDot(eventColors[event.eventType])}></div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineTitle}>{event.title}</div>
                    <div style={styles.timelineDescription}>{event.description}</div>
                    <div style={styles.timelineMeta}>
                      <span>👤 {event.performedBy}</span>
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {slaEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  Chưa có lịch sử xử lý
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;

