import { useState } from 'react';
import type { TicketFromApi } from '../../types';
import { isTicketOverdueAndNotCompleted, generateOverdueNote } from '../../utils/dateUtils';

// Props cho component AssignedTicketsList
interface AssignedTicketsListProps {
  tickets: TicketFromApi[]; // Danh sách tickets được giao cho staff
  onViewDetail: (ticket: TicketFromApi) => void; // Callback khi staff click "Xem chi tiết"
}

// Component hiển thị danh sách tickets được giao cho staff
// - Hiển thị tickets quá hạn ở trên cùng với màu đỏ để dễ nhận biết
// - Hiển thị tickets bình thường ở dưới
// - Có chức năng tìm kiếm theo mã ticket, tiêu đề, địa điểm
// - Hiển thị thời gian còn lại cho mỗi ticket
const AssignedTicketsList = ({ tickets, onViewDetail }: AssignedTicketsListProps) => {
  // Từ khóa tìm kiếm để lọc tickets
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc tickets dựa vào từ khóa tìm kiếm (tìm trong mã ticket, tiêu đề, tên địa điểm)
  const filteredTickets = tickets.filter(ticket => 
    ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tách tickets quá hạn (chưa hoàn thành) ra riêng để hiển thị ưu tiên ở trên cùng
  const overdueTickets = filteredTickets.filter(ticket => 
    isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status)
  );
  // Tickets bình thường (chưa quá hạn hoặc đã hoàn thành)
  const normalTickets = filteredTickets.filter(ticket => 
    !isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status)
  );

  // Format ngày giờ theo định dạng Việt Nam (dd/mm/yyyy, hh:mm)
  // Xử lý timezone Asia/Ho_Chi_Minh và thêm 'Z' nếu thiếu để đảm bảo parse đúng
  const formatDateTime = (dateString: string) => {
    const normalizedDateString = dateString.includes('Z') ? dateString : `${dateString}Z`;
    const date = new Date(normalizedDateString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Tính toán thời gian còn lại đến deadline và trả về text, màu sắc phù hợp
  // - Nếu ticket đã hoàn thành (RESOLVED/CLOSED/CANCELLED): hiển thị "Hoàn thành" màu xanh
  // - Nếu quá hạn: hiển thị "Quá hạn" màu đỏ
  // - Nếu còn < 1 giờ: hiển thị số phút màu đỏ
  // - Nếu còn < 4 giờ: hiển thị giờ + phút màu cam
  // - Nếu còn < 24 giờ: hiển thị số giờ màu vàng
  // - Nếu còn >= 24 giờ: hiển thị số ngày màu xanh
  const getRemainingTime = (deadline: string, status: string) => {
    // Nếu ticket đã hoàn thành, không hiển thị deadline nữa
    if (status === 'RESOLVED' || status === 'CLOSED' || status === 'CANCELLED') {
      return { text: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-50' };
    }
    
    const now = new Date();
    // Thêm 'Z' nếu thiếu để đảm bảo parse đúng (backend có thể trả về không có Z)
    const normalizedDeadline = deadline.includes('Z') ? deadline : `${deadline}Z`;
    const deadlineDate = new Date(normalizedDeadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    // Quá hạn: màu đỏ
    if (diff < 0) {
      return { text: 'Quá hạn', color: 'text-red-600', bg: 'bg-red-50' };
    }
    
    // Còn < 1 giờ: hiển thị phút, màu đỏ (ưu tiên cao)
    if (hours < 1) {
      return { text: `${minutes}m`, color: 'text-red-600', bg: 'bg-red-50' };
    }
    
    // Còn < 4 giờ: hiển thị giờ + phút, màu cam (cần chú ý)
    if (hours < 4) {
      return { text: `${hours}h ${minutes}m`, color: 'text-orange-600', bg: 'bg-orange-50' };
    }
    
    // Còn < 24 giờ: hiển thị số giờ, màu vàng
    if (hours < 24) {
      return { text: `${hours}h`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    
    // Còn >= 24 giờ: hiển thị số ngày, màu xanh (an toàn)
    const days = Math.floor(hours / 24);
    return { text: `${days}d`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Trả về màu sắc và nhãn hiển thị cho từng trạng thái ticket
  // Mỗi trạng thái có màu nền, màu chữ và nhãn tiếng Việt tương ứng
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'NEW': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mới' },
      'ASSIGNED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã giao' },
      'IN_PROGRESS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      'RESOLVED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'chờ đánh giá' },
      'CLOSED': { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Đã hoàn thành' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    // Trả về màu mặc định nếu trạng thái không có trong map
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã ticket, tiêu đề, địa điểm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Overdue Tickets Section */}
      {overdueTickets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-300 overflow-hidden">
          <div className="p-6 border-b border-red-200 bg-red-50">
            <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
              🚨 Tickets Quá Hạn Xử Lí ({overdueTickets.length})
            </h3>
          </div>
          
          <div className="divide-y divide-red-200">
            {overdueTickets.map((ticket) => {
              const statusInfo = getStatusColor(ticket.status);
              const remainingTime = getRemainingTime(ticket.resolveDeadline, ticket.status);
              
              return (
                <div
                  key={ticket.ticketCode}
                  className="p-6 hover:bg-red-50 transition-colors border-l-4 border-red-500 bg-red-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section - Ticket Info */}
                    <div className="flex-1 space-y-3">
                      {/* Ticket Code & Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {ticket.ticketCode}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${remainingTime.bg} ${remainingTime.color}`}>
                          ⏱️ {remainingTime.text}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {ticket.title}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-600 line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Overdue Notification Box */}
                      <div className="mt-3 p-4 bg-red-100 border-l-4 border-red-600 rounded">
                        <div className="flex items-start gap-3">
                          <div className="text-xl">🚨</div>
                          <div>
                            <div className="font-bold text-red-900 text-sm">Ticket đã quá hạn xử lí, hãy vui lòng xử lí nhanh!</div>
                            <div className="text-sm text-red-800 mt-1">Vui lòng ưu tiên hoàn thành ticket này ngay.</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Note Section - with overdue warning if applicable */}
                      {(() => {
                        const isOverdue = isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status);
                        const overdueNote = generateOverdueNote(
                          { 
                            resolveDeadline: ticket.resolveDeadline, 
                            status: ticket.status 
                          },
                          ticket.note
                        );

                        if (isOverdue || (overdueNote && overdueNote.includes('TICKET ĐÃ QUÁ HẠN'))) {
                          return (
                            <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                              <div className="text-xs font-semibold text-red-700 mb-1">🚨 ⚠️ THÔNG BÁO QUAN TRỌNG</div>
                              <div className="text-sm text-red-800 font-medium whitespace-pre-wrap line-clamp-3">{overdueNote}</div>
                            </div>
                          );
                        }

                        if (ticket.note) {
                          return (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-xs font-semibold text-blue-600 mb-1">📝 Ghi chú giải quyết</div>
                              <div className="text-sm text-blue-800 line-clamp-2">{ticket.note}</div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{ticket.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Hạn: {formatDateTime(ticket.resolveDeadline)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section - Action Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => onViewDetail(ticket)}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Tickets được giao ({normalTickets.length})
          </h3>
        </div>
        
        {normalTickets.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {normalTickets.map((ticket) => {
              const statusInfo = getStatusColor(ticket.status);
              const remainingTime = getRemainingTime(ticket.resolveDeadline, ticket.status);
              
              return (
                <div
                  key={ticket.ticketCode}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section - Ticket Info */}
                    <div className="flex-1 space-y-3">
                      {/* Ticket Code & Status */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {ticket.ticketCode}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${remainingTime.bg} ${remainingTime.color}`}>
                          ⏱️ {remainingTime.text}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {ticket.title}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-gray-600 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      {/* Note Section - with overdue warning if applicable */}
                      {(() => {
                        const isOverdue = isTicketOverdueAndNotCompleted(ticket.resolveDeadline, ticket.status);
                        const overdueNote = generateOverdueNote(
                          { 
                            resolveDeadline: ticket.resolveDeadline, 
                            status: ticket.status 
                          },
                          ticket.note
                        );

                        if (isOverdue || (overdueNote && overdueNote.includes('TICKET ĐÃ QUÁ HẠN'))) {
                          return (
                            <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                              <div className="text-xs font-semibold text-red-700 mb-1">🚨 ⚠️ THÔNG BÁO QUAN TRỌNG</div>
                              <div className="text-sm text-red-800 font-medium whitespace-pre-wrap line-clamp-3">{overdueNote}</div>
                            </div>
                          );
                        }

                        if (ticket.note) {
                          return (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-xs font-semibold text-blue-600 mb-1">📝 Ghi chú giải quyết</div>
                              <div className="text-sm text-blue-800 line-clamp-2">{ticket.note}</div>
                            </div>
                          );
                        }

                        return null;
                      })()}
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{ticket.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Hạn: {formatDateTime(ticket.resolveDeadline)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section - Action Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => onViewDetail(ticket)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg">
              {searchTerm ? 'Không tìm thấy ticket nào' : 'Chưa có ticket nào được giao'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTicketsList;
