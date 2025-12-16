import type { Ticket, Location, TicketFromApi } from '../../types';
import Pagination from '../shared/Pagination';

interface TicketsTableProps {
  tickets: Ticket[] | TicketFromApi[];
  locations: Location[];
  staffList?: unknown; // Not used but kept for compatibility
  onAssignTicket?: unknown; // Not used but kept for compatibility
  onViewTicket: (ticket: Ticket | TicketFromApi) => void;
  // Pagination props
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Helper function để check xem ticket có phải từ API không
const isTicketFromApi = (ticket: Ticket | TicketFromApi): ticket is TicketFromApi => {
  return 'ticketCode' in ticket && 'requesterCode' in ticket;
};

const TicketsTable = ({
  tickets,
  locations,
  onViewTicket,
  pageNumber = 1,
  pageSize = 10,
  totalPages = 1,
  totalCount = 0,
  hasPrevious = false,
  hasNext = false,
  onPageChange,
  onPageSizeChange,
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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'open': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mới tạo' },
      'NEW': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mới tạo' },
      'acknowledged': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Đã giao việc' },
      'ASSIGNED': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Đã giao việc' },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      'IN_PROGRESS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      'resolved': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chờ đánh giá' },
      'RESOLVED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Chờ đánh giá' },
      'closed': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã hoàn thành' },
      'CLOSED': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Đã hoàn thành' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Tickets
        </h3>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mã Ticket
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tiêu đề
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mô tả
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Vị trí
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Assigned To
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Hạn giải quyết
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const isFromApi = isTicketFromApi(ticket);
                  const ticketCode = isFromApi ? ticket.ticketCode : ticket.ticketCode || ticket.id.substring(0, 8);
                  const locationName = isFromApi ? ticket.locationName : (locations.find(l => l.id === ticket.location)?.name || ticket.location || 'N/A');
                  const status = ticket.status;
                  const statusInfo = getStatusInfo(status);
                  const resolveDeadline = isFromApi ? ticket.resolveDeadline : (ticket.resolveDeadline || ticket.slaDeadline || ticket.createdAt);
                  const assignedToName = isFromApi ? ticket.assignedToName : ticket.assignedToName || '';

                  return (
                    <tr key={isFromApi ? ticket.ticketCode : ticket.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewTicket(ticket)}>
                      {/* Mã Ticket */}
                      <td className="px-4 py-3.5 text-sm text-gray-900 font-mono font-semibold">
                        {ticketCode}
                      </td>
                      
                      {/* Tiêu đề */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-sm text-gray-900">
                          {ticket.title}
                        </div>
                      </td>
                      
                      {/* Mô tả */}
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {ticket.description}
                        </div>
                      </td>
                      
                      {/* Vị trí */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {locationName}
                      </td>
                      
                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      
                      {/* Assigned To */}
                      <td className="px-4 py-3.5 text-sm">
                        {assignedToName ? (
                          <span className="text-gray-900 font-medium">{assignedToName}</span>
                        ) : (
                          <span className="text-gray-400 italic">Chưa assign</span>
                        )}
                      </td>
                      
                      {/* Hạn giải quyết */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {formatDate(resolveDeadline)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-3.5">
                        <button
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTicket(ticket);
                          }}
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
                  <td colSpan={8} className="px-8 py-12 text-center text-gray-500">
                    Không có ticket nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && onPageChange && onPageSizeChange && (
        <Pagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          totalCount={totalCount}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </>
  );
};

export default TicketsTable;
