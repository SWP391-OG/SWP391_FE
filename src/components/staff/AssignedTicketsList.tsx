import { useState } from 'react';
import type { TicketFromApi } from '../../types';

interface AssignedTicketsListProps {
  tickets: TicketFromApi[];
  onViewDetail: (ticket: TicketFromApi) => void;
}

const AssignedTicketsList = ({ tickets, onViewDetail }: AssignedTicketsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tickets based on search
  const filteredTickets = tickets.filter(ticket => 
    ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculate remaining time
  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return { text: 'Quá hạn', color: 'text-red-600', bg: 'bg-red-50' };
    }
    
    if (hours < 1) {
      return { text: `${minutes}m`, color: 'text-red-600', bg: 'bg-red-50' };
    }
    
    if (hours < 4) {
      return { text: `${hours}h ${minutes}m`, color: 'text-orange-600', bg: 'bg-orange-50' };
    }
    
    if (hours < 24) {
      return { text: `${hours}h`, color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    
    const days = Math.floor(hours / 24);
    return { text: `${days}d`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'NEW': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mới' },
      'ASSIGNED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã giao' },
      'IN_PROGRESS': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      'RESOLVED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giải quyết' },
      'CLOSED': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã đóng' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
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

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Tickets được giao ({filteredTickets.length})
          </h3>
        </div>
        
        {filteredTickets.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => {
              const statusInfo = getStatusColor(ticket.status);
              const remainingTime = getRemainingTime(ticket.resolveDeadline);
              
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
