import type { Ticket, Location, User } from '../../types';

interface Staff {
  id: string;
  name: string;
}

interface TicketsTableProps {
  tickets: Ticket[];
  locations: Location[];
  staffList: Staff[];
  onAssignTicket: (ticketId: string, staffId: string) => void;
  onViewTicket: (ticket: Ticket) => void;
}

const TicketsTable = ({
  tickets,
  locations,
  staffList,
  onAssignTicket,
  onViewTicket,
}: TicketsTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          Danh sách Tickets
        </h3>
      </div>

      {/* Tickets Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <thead>
          <tr>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>ID</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Tiêu đề & Mô tả</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Vị trí</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Trạng thái</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Độ ưu tiên</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Người xử lý</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Ngày tạo</th>
            <th style={{
              background: '#f9fafb',
              padding: '0.875rem 1rem',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb',
            }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length > 0 ? (
            tickets.map((ticket) => {
              const statusInfo = {
                open: { bg: '#dbeafe', color: '#1e40af', text: 'Mới tạo' },
                'acknowledged': { bg: '#e0e7ff', color: '#3730a3', text: 'Đã giao việc' },
                'in-progress': { bg: '#fef3c7', color: '#92400e', text: 'Đang xử lý' },
                resolved: { bg: '#d1fae5', color: '#065f46', text: 'Đã giải quyết' },
                closed: { bg: '#f3f4f6', color: '#374151', text: 'Đã đóng' },
                cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'Đã hủy' },
              }[ticket.status] || { bg: '#f3f4f6', color: '#374151', text: ticket.status };

              const priorityInfo = {
                low: { bg: '#d1fae5', color: '#065f46', text: 'Thấp' },
                medium: { bg: '#fef3c7', color: '#92400e', text: 'Trung bình' },
                high: { bg: '#fed7aa', color: '#9a3412', text: 'Cao' },
                urgent: { bg: '#fee2e2', color: '#991b1b', text: 'Khẩn cấp' },
              }[ticket.priority];

              // Get location name
              const location = locations.find(l => l.id === ticket.location);
              const locationName = location ? location.name : ticket.location || 'N/A';

              // Get assigned staff name
              const assignedStaff = staffList.find(s => s.id === ticket.assignedTo);

              return (
                <tr key={ticket.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {/* ID */}
                  <td style={{
                    padding: '0.875rem 1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }}>
                    {ticket.id.substring(0, 8)}
                  </td>
                  
                  {/* Tiêu đề & Mô tả */}
                  <td style={{
                    padding: '0.875rem 1rem',
                    color: '#1f2937',
                    maxWidth: '300px',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      {ticket.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: '280px',
                    }}>
                      {ticket.description}
                    </div>
                  </td>
                  
                  {/* Vị trí */}
                  <td style={{
                    padding: '0.875rem 1rem',
                    color: '#4b5563',
                    fontSize: '0.875rem',
                  }}>
                    {locationName}
                  </td>
                  
                  {/* Trạng thái */}
                  <td style={{
                    padding: '0.875rem 1rem',
                  }}>
                    <span style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      display: 'inline-block',
                    }}>
                      {statusInfo.text}
                    </span>
                  </td>
                  
                  {/* Độ ưu tiên */}
                  <td style={{
                    padding: '0.875rem 1rem',
                  }}>
                    <span style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: priorityInfo.bg,
                      color: priorityInfo.color,
                      display: 'inline-block',
                    }}>
                      {priorityInfo.text}
                    </span>
                  </td>
                  
                  {/* Người xử lý */}
                  <td style={{
                    padding: '0.875rem 1rem',
                    color: '#4b5563',
                    fontSize: '0.875rem',
                  }}>
                    {ticket.assignedTo && assignedStaff ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{assignedStaff.name}</span>
                        <select
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            background: 'white',
                            color: '#6b7280',
                          }}
                          value={ticket.assignedTo}
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssignTicket(ticket.id, e.target.value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {staffList.map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        style={{
                          padding: '0.35rem 0.65rem',
                          border: '1px solid #f97316',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: 'white',
                          color: '#f97316',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (staffList.length > 0) {
                            const firstStaff = staffList[0];
                            onAssignTicket(ticket.id, firstStaff.id);
                          }
                        }}
                        title="Giao việc"
                      >
                        Assign +
                      </button>
                    )}
                  </td>
                  
                  {/* Ngày tạo */}
                  <td style={{
                    padding: '0.875rem 1rem',
                    color: '#6b7280',
                    fontSize: '0.75rem',
                  }}>
                    {formatDate(ticket.createdAt)}
                  </td>
                  
                  {/* Hành động */}
                  <td style={{
                    padding: '0.875rem 1rem',
                  }}>
                    <button
                      style={{
                        background: '#f97316',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'white',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ea580c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f97316';
                      }}
                      onClick={() => onViewTicket(ticket)}
                      title="Xem chi tiết"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}>
                Không có ticket nào trong department của bạn
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default TicketsTable;
