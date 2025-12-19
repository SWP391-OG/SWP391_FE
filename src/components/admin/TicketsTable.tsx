// Bảng hiển thị danh sách Tickets trong admin (dữ liệu từ API, phân trang phía server)
import type { Ticket, Location, TicketFromApi } from '../../types';
import Pagination from '../shared/Pagination';
import { isTicketOverdueAndNotCompleted } from '../../utils/dateUtils';

// Props cho component TicketsTable - nhận sẵn dữ liệu đã phân trang từ API
interface TicketsTableProps {
  tickets: Ticket[] | TicketFromApi[];
  locations: Location[];
  staffList?: unknown; // Not used but kept for compatibility
  onAssignTicket?: unknown; // Not used but kept for compatibility
  onViewTicket: (ticket: Ticket | TicketFromApi) => void;
  // Search and filter props
  searchQuery?: string;
  filterStatus?: string;
  onSearchChange?: (query: string) => void;
  onFilterStatusChange?: (status: string) => void;
  // Pagination props (server-side)
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Helper function để check xem ticket có phải dạng TicketFromApi (từ backend) không
const isTicketFromApi = (ticket: Ticket | TicketFromApi): ticket is TicketFromApi => {
  return 'ticketCode' in ticket && 'requesterCode' in ticket;
};

// Component bảng Tickets: hỗ trợ search, filter trạng thái và điều khiển phân trang server-side
const TicketsTable = ({
  tickets,
  locations,
  onViewTicket,
  searchQuery = '',
  filterStatus = 'all',
  onSearchChange,
  onFilterStatusChange,
  pageNumber = 1,
  pageSize = 10,
  totalCount = 0,
  totalPages = 0,
  hasNext = false,
  hasPrevious = false,
  onPageChange,
  onPageSizeChange,
}: TicketsTableProps) => {
  // Phân trang phía server: danh sách tickets đã được API phân trang sẵn
  // Không filter/paginate thêm ở phía client
  const paginatedTickets = tickets;

  // Helper format ngày giờ theo chuẩn Việt Nam
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Mapping trạng thái backend -> màu sắc + nhãn tiếng Việt hiển thị trong bảng
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
      'OVERDUE': { bg: 'bg-red-100', text: 'text-red-800', label: 'Quá hạn' },
      'overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'Quá hạn' },
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Danh sách Tickets
        </h3>
      </div>

      {/* Search and Filter */}
      {(onSearchChange || onFilterStatusChange) && (
        <div className="flex gap-4 mb-6 items-center">
          {onSearchChange && (
            <input
              type="text"
              placeholder="Tìm kiếm theo mã ticket, tiêu đề, vị trí..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          )}
          {onFilterStatusChange && (
            <select
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md text-sm cursor-pointer bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="NEW">Mới tạo</option>
              <option value="ASSIGNED">Đã giao việc</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Chờ đánh giá</option>
              <option value="CLOSED">Đã hoàn thành</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          )}
        </div>
      )}

      {/* Tickets Table - Scrollable area */}
      <div className="flex-1 overflow-auto min-h-0 mb-6">
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
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">
                        {searchQuery || filterStatus !== 'all' 
                          ? 'Không tìm thấy ticket nào phù hợp với bộ lọc' 
                          : 'Không có ticket nào'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const isFromApi = isTicketFromApi(ticket);
                  const ticketCode = isFromApi ? ticket.ticketCode : ticket.ticketCode || ticket.id.substring(0, 8);
                  const locationName = isFromApi ? ticket.locationName : (locations.find(l => l.id === ticket.location)?.name || ticket.location || 'N/A');
                  const status = ticket.status;
                  const resolveDeadline = isFromApi ? ticket.resolveDeadline : (ticket.resolveDeadline || ticket.slaDeadline || ticket.createdAt);
                  const resolvedAt = isFromApi ? ticket.resolvedAt : (ticket as any).resolvedAt;
                  const assignedToName = isFromApi ? ticket.assignedToName : ticket.assignedToName || '';

                  // Check if ticket is overdue
                  const isOverdue = isTicketOverdueAndNotCompleted(resolveDeadline, status, resolvedAt);
                  const statusInfo = isOverdue 
                    ? { bg: 'bg-red-100 border border-red-500 shadow-lg', text: 'text-red-800 font-bold', label: 'Quá hạn' } 
                    : getStatusInfo(status);

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
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Pagination - Always at bottom */}
      {onPageChange && onPageSizeChange && (
        <div className="mt-auto">
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
        </div>
      )}
    </div>
  );
};

export default TicketsTable;
