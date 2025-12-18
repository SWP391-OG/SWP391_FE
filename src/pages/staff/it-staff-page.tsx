import { useMemo } from 'react';
import type { Ticket } from '../../types';
import { isTicketOverdue, getTimeUntilDeadline, isTicketOverdueAndNotCompleted } from '../../utils/dateUtils';

interface ITStaffPageProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, status: Ticket['status']) => void;
  onViewDetail: (ticket: Ticket) => void;
}

const ITStaffPage = ({ tickets, onUpdateStatus, onViewDetail }: ITStaffPageProps) => {
  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length,
    };
  }, [tickets]);

  return (
    <div className="max-w-[1400px] mx-auto p-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Tổng số</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
          <div className="text-sm text-blue-600 mt-1">Mở</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-yellow-600 mt-1">Đang xử lý</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{stats.resolved}</div>
          <div className="text-sm text-blue-600 mt-1">chờ đánh giá</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.closed}</div>
          <div className="text-sm text-emerald-600 mt-1">Đã hoàn thành</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-red-600 mt-1">Bị hủy</div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Danh sách Tickets được giao ({tickets.length})</h3>
        </div>
        
        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  background: '#f9fafb',
                  borderBottom: '2px solid #e5e7eb',
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>ID</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>Tiêu đề</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>Trạng thái</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>SLA</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const statusInfo = {
                    open: { bg: '#dbeafe', color: '#1e40af', text: 'Mới tạo' },
                    'NEW': { bg: '#dbeafe', color: '#1e40af', text: 'Mới tạo' },
                    assigned: { bg: '#e0e7ff', color: '#3730a3', text: 'Đã giao việc' },
                    'ASSIGNED': { bg: '#e0e7ff', color: '#3730a3', text: 'Đã giao việc' },
                    'in-progress': { bg: '#fef3c7', color: '#92400e', text: 'Đang xử lý' },
                    'IN_PROGRESS': { bg: '#fef3c7', color: '#92400e', text: 'Đang xử lý' },
                    resolved: { bg: '#dbeafe', color: '#1e40af', text: 'Chờ đánh giá' },
                    'RESOLVED': { bg: '#dbeafe', color: '#1e40af', text: 'Chờ đánh giá' },
                    closed: { bg: '#d1fae5', color: '#065f46', text: 'Đã hoàn thành' },
                    'CLOSED': { bg: '#d1fae5', color: '#065f46', text: 'Đã hoàn thành' },
                    cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'Đã hủy' },
                    'CANCELLED': { bg: '#fee2e2', color: '#991b1b', text: 'Đã hủy' },
                  }[ticket.status] || { bg: '#f3f4f6', color: '#374151', text: ticket.status };

                  // Check if ticket is overdue and not completed
                  const isOverdue = isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status);

                  // Calculate SLA status using timezone-aware function
                  const overdue = isTicketOverdue(ticket.resolveDeadline);
                  const { hours: hoursRemaining } = getTimeUntilDeadline(ticket.resolveDeadline);
                  const slaStatus = ticket.status === 'resolved' || ticket.status === 'closed'
                    ? (isTicketOverdue(ticket.resolveDeadline) ? 'overdue' : 'completed')
                    : overdue
                    ? 'overdue'
                    : hoursRemaining < 2
                    ? 'warning'
                    : hoursRemaining < 6
                    ? 'attention'
                    : 'ok';

                  const slaInfo = {
                    ok: { bg: '#d1fae5', color: '#065f46', text: 'Đúng hạn' },
                    attention: { bg: '#fef3c7', color: '#92400e', text: 'Cần chú ý' },
                    warning: { bg: '#fed7aa', color: '#9a3412', text: 'Sắp quá hạn' },
                    overdue: { bg: '#fee2e2', color: '#991b1b', text: 'Quá hạn' },
                    completed: { bg: '#d1fae5', color: '#065f46', text: 'Hoàn thành' },
                  }[slaStatus];

                  return (
                    <tr key={ticket.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    >
                      <td style={{
                        padding: '1rem',
                        color: '#1f2937',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}>{ticket.id}</td>
                      <td style={{
                        padding: '1rem',
                        color: '#1f2937',
                        maxWidth: '300px',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{ticket.title}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.description}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}>
                          {isOverdue ? '⚠️ Đã quá hạn' : statusInfo.text}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: slaInfo.bg,
                          color: slaInfo.color,
                        }}>
                          {slaInfo.text}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* Status Update Dropdown */}
                          <select
                            style={{
                              padding: '0.5rem 0.75rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              background: 'white',
                              minWidth: '140px',
                            }}
                            value={ticket.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as Ticket['status'];
                              const newStatusText = {
                                open: 'Mở',
                                'NEW': 'Mới tạo',
                                assigned: 'Đã giao việc',
                                'ASSIGNED': 'Đã giao việc',
                                'in-progress': 'Đang xử lý',
                                'IN_PROGRESS': 'Đang xử lý',
                                resolved: 'chờ đánh giá',
                                'RESOLVED': 'chờ đánh giá',
                                closed: 'Đã hoàn thành',
                                'CLOSED': 'Đã hoàn thành',
                                cancelled: 'Đã hủy',
                                'CANCELLED': 'Đã hủy',
                              }[newStatus];
                              if (confirm(`Bạn có chắc muốn cập nhật trạng thái ticket ${ticket.id} thành "${newStatusText}"?`)) {
                                onUpdateStatus(ticket.id, newStatus);
                              } else {
                                // Reset dropdown to original value if cancelled
                                e.target.value = ticket.status;
                              }
                            }}
                          >
                            <option value="open">Mở</option>
                            <option value="in-progress">Đang xử lý</option>
                            <option value="resolved">chờ đánh giá</option>
                            <option value="closed">Đã hoàn thành</option>
                          </select>
                          
                          {/* View Detail Button */}
                          <button
                            style={{
                              background: 'none',
                              border: '1px solid #d1d5db',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              color: '#374151',
                            }}
                            onClick={() => onViewDetail(ticket)}
                            title="Xem chi tiết"
                          >
                            Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có ticket nào được giao</h3>
            <p className="text-gray-500">Bạn sẽ thấy các ticket được Admin giao cho bạn ở đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITStaffPage;
